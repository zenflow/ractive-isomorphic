// things that RactiveExpress and Page have in common
var _ = require('lodash');
var on_client = require('on-client');

var common = {};

common.common = {
	_: _,
	on_client: on_client
};

common.data = _.assign({
	getUrl: function(route, params) {
		return this.root.router.toUrl(route, params);
	}
}, common.common);

common.props = _.assign({
	onroute: function(){/*noop*/}
}, common.common);

module.exports = common;