var Ractive = require('ractive');
var Site = require('./Site');
var Page = require('./Page');

var ri = {
	Ractive: Ractive,
	Promise: Ractive.Promise,
	Site: Site,
	Page: Page
};

module.exports = ri;