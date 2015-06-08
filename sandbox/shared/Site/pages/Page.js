var ri = require('../../../../lib');
var Page = ri.Page.extend({
	onconfig: function(){
		var self = this;
		self.on('route', function(route, is_initial){
			console.log('Page route', route, is_initial);
		});
		self._super.apply(self, arguments);
	}
});
module.exports = Page;