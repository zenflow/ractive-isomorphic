var on_client = require('on-client');

var _static = {};
if (on_client){
	_static.client = function(params){
		var self = this;
		var ViewModel = self.extend(params);
		var vm = new ViewModel({append: false});
		var render = function(){
			vm.render(window.document.body);
		};
		if (vm.waitr.ready){
			render();
		} else {
			vm.waitr.once('ready', render);
		}
		return vm;
	};
} else {
	_static.server = function(params){
		var self = this;
		var ViewModel = self.extend(params);
		return function(req, res, next){
			var vm = new ViewModel({url: req.url});
			if (!vm.router.route){
				return next();
			}
			var respond = function(){
				res.setHeader('Content-Type', 'text/html');
				res.statusCode = vm.get('status-code');
				res.end(vm.toHTML());
				vm.teardown();
			};
			if (vm.waitr.ready){
				respond();
			} else {
				vm.waitr.once('ready', respond);
			}
		}
	};
}

module.exports = _static;