// members to be attached to each viewmodel instance AND its data object
var _ = require('lodash');
var on_client = require('on-client');
var helpers = {
	_: _,
	on_client: on_client,
	getUrl: function(route, params){
		return this.root.router.toUrl(route, params);
	}
};
module.exports = helpers;