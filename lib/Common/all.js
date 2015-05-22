var _ = require('lodash');
var data = {
	_: _,
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
module.exports = _.assign({}, data, {data: data});