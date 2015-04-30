var _ = require('lodash');
var on_client = require('on-client');

var options = {
	use_data_script: true,
	data: {
		'status-code': 200,
		title: ''
	},
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		options.data = _.assign(
			{},
			on_client && self.use_data_script && window._site_vm_data || {},
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
		// site vm route-handler
		if (on_client && self.use_data_script && window._site_vm_data){
			delete window._site_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if (on_client){
			// site vm route-handler
			self.observe('params', function(params){
				self._onroute(false);
			}, {init: false});
		}
	},
	_onroute: function(is_initial){
		var self = this;
		if (typeof self.onroute=='function'){
			var result = self.onroute(self.router.route, self.router.params, is_initial);
			if ((typeof result=='object') && (typeof result.then=='function')){
				self._promise = result;
			}
		}
		self.fire('route', self.router.route, self.router.params, is_initial);
	}
};

module.exports = options;