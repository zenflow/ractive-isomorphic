var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');

var Page = Ractive.extend({
	isolated: true,
	_: _,
	on_client: on_client,
	data: {
		_: _,
		on_client: on_client
	},
	onroute: function(params, is_init){/*noop*/},
	onconstruct: function(options){
		var self = this;
		self.root.page = self;
		self.root.Page = self.constructor;
		self.router = self.root.router;
		self.api = self.root.api;
		options.data = _.assign({}, options.data || {}, {
			getUrl: self.root.get('getUrl')
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
				// (nothing is perfect)
				if (self.router.route == self.name){
					self.onroute(self.router.params, false);
				}
			}, {init: false});
		}
	}
});

module.exports = Page;