var Ractive = require('ractive');
var _ = require('lodash');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');
var instanceMethods = require('./instanceMethods');
var staticMethods = require('./staticMethods');

var options = _.assign({
	name: 'Site',
	debug: 0,
	useDataScript: true,
	baseUrl: '/',
	data: {status: 200},
	append: false,
	staticMembers: _.assign({
	}, staticMethods)
}, instanceMethods);

var Site = Ractive.extend(common_all, common_page_and_site, options);

module.exports = Site;