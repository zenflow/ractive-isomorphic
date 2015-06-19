var Ractive = require('ractive');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');
var instanceMethods = require('./instanceMethods');
var staticMembers = require('./staticMembers');

var Site = Ractive.extend(common_all, common_page_and_site, instanceMethods, {
	name: 'Site',
	debug: 0,
	useDataScript: true,
	baseUrl: '/',
	data: {status: 200},
	append: false,
	staticMembers: staticMembers
});

module.exports = Site;