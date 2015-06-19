var Ractive = require('ractive');
var onconstruct = require('./onconstruct');
var onconfig = require('./onconfig');
var oninit = require('./oninit');
var common_options_all = require('../common_options_all');
var common_options_page_site = require('../common_options_page_site');

var Page = Ractive.extend(common_options_all, common_options_page_site, {
	isolated: true,
	onconstruct: onconstruct,
	onconfig: onconfig,
	oninit: oninit
});

module.exports = Page;