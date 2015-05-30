var assignStaticMembers;
if (process.browser){
	assignStaticMembers = function(){};
} else {
	var middlewareSeries = require('middleware-flow').series;
	var serveFavicon = require('serve-favicon');
	var path = require('path');
	var errors = require('../errors');

	var connect = function(params){
		var self = this;
		var Site = self.extend(params);
		return middlewareSeries(
			serveFavicon(path.join(__dirname, '..', '..', 'favicon.ico')),
			function(req, res, next){
				var site;
				try { site = new Site({url: req.url}); }
				catch (error){
					if (error instanceof errors.NoMatchingUrlError){
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
			}
		);
	};
	assignStaticMembers = function(Class){
		Class.connect = connect;
	};
}
module.exports =  assignStaticMembers;