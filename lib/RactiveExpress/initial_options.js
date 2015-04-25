var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var common = require('../common');

var initial_options = _.assign({}, common, {
	use_data_script: true,
	onroute: function(params, is_init){/*noop*/},
	data: _.assign({}, common, {
		'status-code': 200,
		title: 'ractive-express sandbox'
	}),
	onconfig: function(){
		var self = this;
		// main vm route-handler
		if (on_client && self.use_data_script){
			delete window._main_vm_data;
		} else {
			self.onroute(self.router.route, self.router.params, true);
		}
	},
	oninit: function(){
		var self = this;
		if (on_client){
			// main vm route-handler
			self.observe('params', function(params){
				self.onroute(self.router.route, self.router.params, false);
			}, {init: false});
		}
	},
	onteardown: function(){
		var self = this;
		self.router.destroy();
		self.waitr.destroy();
	}
});

module.exports = initial_options;