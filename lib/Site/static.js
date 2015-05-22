var _ = require('lodash');

var _static = {};
if (_.support.dom){
	_static.client = function(params){
		var self = this;
		var Site = self.extend(params);
		var vm = new Site({append: false});
		vm.once('ready', function(){
			vm.render(window.document.getElementsByClassName('ri-body'));
		});
		return vm;
	};
} else {
	_static.connect = function(params){
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
	};
}

module.exports = _static;