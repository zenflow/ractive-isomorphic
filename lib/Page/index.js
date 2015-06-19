var Ractive = require('ractive');
var _ = require('lodash');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');
var instanceMethods = require('./instanceMethods');

var options = _.assign({
	isolated: true
}, instanceMethods);

var Page = Ractive.extend(common_all, common_page_and_site, options);

module.exports = Page;