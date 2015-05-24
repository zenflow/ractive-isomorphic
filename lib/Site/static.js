var _ = require('lodash');
var static_methods;
if (_.support.dom){
	static_methods = {};
} else {
	var middlewareSeries = require('middleware-flow').series;
	var serveFavicon = require('serve-favicon');
	var path = require('path');
	var errors = require('../errors');
	var connect = function(params){
		var self = this;
		var Site = self.extend(params);
		return middlewareSeries(
			serveFavicon(path.join(process.cwd(), Site.prototype.favicon)),
			function(req, res, next){
				var vm;
				try { vm = new Site({url: req.url}); }
				catch (error){
					if (error instanceof errors.NoMatchingUrlError){
						return next();
					} else {
						return next(error);
					}
				}
				vm.once('ready', function(){
					res.setHeader('Content-Type', 'text/html');
					res.statusCode = vm.get('status-code');
					res.end(vm.toHTML());
					vm.teardown();
				});
			}
		);
	};
	static_methods = {connect: connect};
}
module.exports =  static_methods;