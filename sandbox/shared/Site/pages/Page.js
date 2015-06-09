var ri = require('../../../../lib');
var Page = ri.Page.extend({
	onconfig: function(){
		var self = this;
		self._super.apply(self, arguments);
	}
});
module.exports = Page;