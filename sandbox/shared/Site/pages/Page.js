var ri = require('../../../../lib');
var Page = ri.Page.extend({
	onroute: function(params, is_initial){
		var self = this;
		console.log('Page onroute', params, is_initial);
		// self._super.apply(self, arguments); //?!?
	}
});
module.exports = Page;