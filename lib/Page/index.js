var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var common = require('../common');

var options = _.assign({}, common.props, {
	isolated: true,
	data: _.assign({}, common.data),
	onconstruct: function(options){
		var self = this;
		self.root.page = self;
		self.root.Page = self.constructor;
		self.router = self.root.router;
		self.api = self.root.api;
		options.data = _.assign(
			{},
			on_client && self.root.use_data_script ? window._page_vm_data : {},
			options.data || {}
		);
	},
	onconfig: function(){
		var self = this;
		// page vm route-handler
		if (on_client && self.root.use_data_script){
			delete window._page_vm_data;
		} else {
			self.onroute(self.router.params, true);
		}
	},
	oninit: function(){
		var self = this;
		if (on_client){
			// page vm route-handler
			self.observe('params', function(params){
				// following condition necessary since ractive will update params for a component it is about to remove
				if (self.router.route == self.name){
					self.onroute(self.router.params, false);
				}
			}, {init: false});
		}
	}
});

var Page = Ractive.extend(options);

module.exports = Page;