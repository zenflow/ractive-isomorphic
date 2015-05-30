var _ = require('lodash');
var Ractive = require('ractive');
var common_options_all = require('./common_options_all');
var common_options_page_site = require('./common_options_page_site');

var Page = Ractive.extend(common_options_all, common_options_page_site, {
	isolated: true,
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		self.root.page = self;
		self.root.Page = self.constructor;
		self.api = self.root.api;
		options.data = _.assign(
			{},
			process.browser && self.root.use_data_script && window._page_vm_data || {},
			options.data || {}
		);
	},
	onconfig: function(){
		var self = this;
		self._super.apply(self, arguments);
		// page vm route-handler
		if (process.browser && self.root.use_data_script && window._page_vm_data){
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
			self.observe('params', function(params, old){
				// following condition necessary since ractive will update params for a component it is about to remove
				if (self.root.router.route == self.name){
					self._onroute(false);
				}
			}, {init: false});
		}
	},
	_onroute: function(is_initial){
		var self = this;
		var result = typeof self.onroute=='function' ? self.onroute(self.root.router.params, is_initial) : null;
		self._super(result);
		self.fire('route', self.root.router.params, is_initial);
	}
});

module.exports = Page;