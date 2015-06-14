var wrapRactive = require('wrap-ractive');
var filterOptions = require('./filterOptions');
var static_members = require('./static_members');
var common_options_all = require('../common_options_all');
var common_options_page_site = require('../common_options_page_site');
var options = require('./options');

var Site = wrapRactive(filterOptions, static_members).extend(common_options_all, common_options_page_site, options);

module.exports = Site;