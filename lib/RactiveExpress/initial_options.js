var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var common = require('../common');

var initial_options = _.assign({}, common.props, {
	use_data_script: true,
	data: _.assign({}, common.data, {
		'status-code': 200,
		title: 'ractive-express sandbox'
	}),
	onconstruct: function(options){
		var self = this;
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
		// main vm route-handler
		if (on_client && self.use_data_script && window._main_vm_data){
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