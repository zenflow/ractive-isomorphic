var wrap = require('../util/wrap');
var Ractive = require('ractive');
var options = require('./options');
var filterOptions = require('./filterOptions');
var _static = require('./static');
var initialise = require('./initialise');
var common_options_all = require('../common_options_all');
var common_options_page_site = require('../common_options_page_site');

var Site = wrap(Ractive, [common_options_all, common_options_page_site, options], filterOptions, _static, initialise);

module.exports = Site;