var Ractive = require('ractive');
var wrap = require('../util/wrap');

var options = require('./options');
var filterOptions = require('./filterOptions');
var static = require('./static');
var initialise = require('./initialise');

var RactiveExpress = wrap(Ractive, options, filterOptions, static, initialise);

module.exports = RactiveExpress;