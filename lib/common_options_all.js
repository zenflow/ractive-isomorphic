var _ = require('lodash');

module.exports = {
	data: {_: _},
	staticMembers: {_: _},
	onconstruct: function(options){
		var self = this;
		self.site = self.root;
		self.api = self.site.api;
	}
};