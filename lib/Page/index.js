var Ractive = require('ractive');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');
var instanceMethods = require('./instanceMethods');

var Page = Ractive.extend(common_all, common_page_and_site, instanceMethods, {
	isolated: true
});

module.exports = Page;