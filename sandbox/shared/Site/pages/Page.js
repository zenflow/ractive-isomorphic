var ri = require('../../../../lib');
var Page = ri.Page.extend({
	onconfig: function(){
		var self = this;
		self.on('route', function(params, is_initial){
			console.log('Page route', params, is_initial);
		});
		self._super.apply(self, arguments);
	}
});
module.exports = Page;