var Ractive = require('ractive');
var _ = require('lodash');
var on_client = require('on-client');
var common_common = {
	_: _,
	on_client: on_client
};
var Common = Ractive.extend(_.assign({}, common_common, {
	data: _.assign({}, common_common, {
		getUrl: function(route, params) {
			return this.root.router.toUrl(route, params);
		}
	}),
	onroute: function(){/*noop*/}
}));
module.exports = Common;