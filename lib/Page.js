var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');

var Page = Ractive.extend({
	isolated: true,
	on_client: on_client,
	onconstruct: function(options){
		var self = this;
		self.root.page = self;
		self.root.Page = self.constructor;
		self.router = self.root.router;
		self.api = self.root.api;
		options.data = _.assign({}, options.data || {}, {
			getUrl: function(route, params){
				return self.router.toUrl(route, params);
			}
		})
	},
	onconfig: function(){
		var self = this;
		// execute page route-handler
		self.onroute(self.router.params, true);
	},
	oninit: function(){
		var self = this;
		if (on_client){
			// execute page route-handler
			self.observe('params', function(params){
				// following condition necessary since ractive will update params for a component it is about to remove
				if (self.router.route == self.name){
					self.onroute(self.router.params, false);
				}
			}, {init: false});
		}
	},
	data: {
		on_client: on_client
	}
});

module.exports = Page;