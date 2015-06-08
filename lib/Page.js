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
				route: self.parent.router.route,
				Route: self.parent.router.Route
			}
		);
		if (process.browser && self.parent.use_data_script && window._page_vm_data){
			delete window._page_vm_data;
		}
	}
});

module.exports = Page;