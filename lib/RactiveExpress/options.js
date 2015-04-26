var _ = require('lodash');
var on_client = require('on-client');

var options = {
	use_data_script: true,
	data: {
		'status-code': 200,
		title: 'ractive-express sandbox'
	},
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		options.data = _.assign(
			{},
			on_client && self.use_data_script && window._main_vm_data || {},
			options.data || {},
			{
				route: self.router.route,
				params: self.router.params
			}
		);
	},
	onconfig: function(){
		var self = this;
		self._super.apply(self, arguments);
		// main vm route-handler
		if (on_client && self.use_data_script && window._main_vm_data){
			delete window._main_vm_data;
		} else {
			self.onroute(self.router.route, self.router.params, true);
		}
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if (on_client){
			// main vm route-handler
			self.observe('params', function(params){
				self.onroute(self.router.route, self.router.params, false);
			}, {init: false});
		}
	}
};

module.exports = options;