var _ = require('lodash');
var Ractive = require('ractive');
var common_options_all = require('./common_options_all');
var common_options_page_site = require('./common_options_page_site');

var Page = Ractive.extend(common_options_all, common_options_page_site, {
	isolated: true,
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		self.site = self.parent;
		self.site.page = self;
		self.site.Page = self.constructor;
		self.api = self.site.api;
		options.data = _.assign(
			{},
			process.browser && self.site.use_data_script && window._page_vm_data || {},
			options.data || {},
			{
				route: self.site.router.route,
				Route: self.site.router.Route
			}
		);
	},
	onconfig: function(){
		var self = this;
		// handle initial `Page#onroute`
		if (process.browser && self.site.use_data_script && window._page_vm_data){
			delete window._page_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;
		if (process.browser){
			// handle following `Page#onroute`s
			self.observe('route', function(route){
				self._onroute(false);
			}, {init: false});
		}
	}
});

module.exports = Page;