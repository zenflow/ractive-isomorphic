var on_client = require('on-client');

var _static = {};
if (on_client){
	_static.client = function(params){
		var self = this;
		var ViewModel = self.extend(params);
		var vm = new ViewModel({append: false});
		vm.once('ready', function(){
			vm.render(window.document.body);
		});
		return vm;
	};
} else {
	_static.connect = function(params){
		var self = this;
		var ViewModel = self.extend(params);
		return function(req, res, next){
			var vm = new ViewModel({url: req.url});
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