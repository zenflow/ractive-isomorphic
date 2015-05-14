var wrap = require('../util/wrap');
var Ractive = require('ractive');
var common = require('../common');
var options = require('./options');
var filterOptions = require('./filterOptions');
var _static = require('./static');
var initialise = require('./initialise');

var Site = wrap(Ractive, [common.all, common.page_site, options], filterOptions, _static, initialise);

module.exports = Site;