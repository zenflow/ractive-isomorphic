var filterOptions = require('./filterOptions');
if (!process.browser) {
	var middlewareSeries = require('middleware-flow').series;
	var serveFavicon = require('serve-favicon');
	var path = require('path');
	var errors = require('../errors');
}
var staticMembers = {
	extend: function(){
		var self = this;
		for (var i in arguments){
			filterOptions(arguments[i], self);
		}
		return self._super.apply(self, arguments);
	}
};
if (!process.browser){
	staticMembers.connect = function(params){
		var self = this;
		var Site = self.extend(params);
		var vm_middleware = function(req, res, next){
			var site;
			try { site = new Site({url: req.url}); }
			catch (error){
				if (error instanceof errors.InvalidRouteError){
					return next();
				} else {
					return next(error);
				}
			}
			site.once('ready', function(){
				res.setHeader('Content-Type', 'text/html');
				res.statusCode = site.get('status');
				res.end(site.toHTML());
				site.teardown();
			});
		};
		if (Site.prototype.baseUrl=='/'){
			return middlewareSeries(serveFavicon(path.join(__dirname, '..', '..', 'favicon.ico')), vm_middleware);
		} else {
			return vm_middleware;
		}

	};
}

module.exports =  staticMembers;