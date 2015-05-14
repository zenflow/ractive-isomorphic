var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var Site = require('./Site');
var Page = require('./Page');
var Component = require('./Component');

var ri = {
	_: _,
	on_client: on_client,
	Ractive: Ractive,
	Promise: Ractive.Promise,
	Site: Site,
	Page: Page,
	Component: Component
};

module.exports = ri;