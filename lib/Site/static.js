var _ = require('lodash');

module.exports = _.support.dom ? {} : {
	connect: function(params){
		var self = this;
		var Site = self.extend(params);
		return function(req, res, next){
			var vm = new Site({url: req.url});
			if (!vm.router.route){
				return next();
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