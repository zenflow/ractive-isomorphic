var _ = require('lodash');
var Ractive = require('ractive');
var common_options_all = require('./common_options_all');
var common_options_page_site = require('./common_options_page_site');

var Page = Ractive.extend(common_options_all, common_options_page_site, {
	isolated: true,
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		self.parent.page = self;
		self.parent.Page = self.constructor;
		self.api = self.parent.api;
		options.data = _.assign(
			{},
			process.browser && self.parent.use_data_script && window._page_vm_data || {},
			options.data || {},
			{
				Route: self.parent.router.Route
			}
		);
	},
	onconfig: function(){
		var self = this;
		self._super.apply(self, arguments);
		// page vm route-handler
		if (process.browser && self.parent.use_data_script && window._page_vm_data){
			delete window._page_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if (process.browser){
			// page vm route-handler
			self.observe('route', function(route){
				// following condition necessary since ractive will update params for a component it is about to remove
				if (route.name == self.name){
					self._onroute(false);
				}
			}, {init: false});
		}
	}
});

module.exports = Page;