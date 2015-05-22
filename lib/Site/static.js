var _ = require('lodash');
var errors = require('../errors');
module.exports = _.support.dom ? {} : {
	connect: function(params){
		var self = this;
		var Site = self.extend(params);
		return function(req, res, next){
			var vm;
			try {
				vm = new Site({url: req.url});
			} catch (error){
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
	}
};