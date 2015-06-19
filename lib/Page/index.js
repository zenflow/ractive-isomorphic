var Ractive = require('ractive');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');
var onconstruct = require('./onconstruct');
var onconfig = require('./onconfig');
var oninit = require('./oninit');

var Page = Ractive.extend(common_all, common_page_and_site, {
	isolated: true,
	onconstruct: onconstruct,
	onconfig: onconfig,
	oninit: oninit
});

module.exports = Page;