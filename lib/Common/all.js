var _ = require('lodash');
var base_and_data = {
	//_: _,
	getUrl: function(route, params) {
		return this.root.router.toUrl(route || this.root.page.name, params);
	},
	setRoute: function(route, params){
		this.root.router.setRoute(route || this.root.page.name, params);
	},
	pushRoute: function(route, params) {
		this.root.router.pushRoute(route || this.root.page.name, params);
	}
};
module.exports = _.assign({}, base_and_data, {
	data: _.assign({}, base_and_data, {
		_: _
	})
});