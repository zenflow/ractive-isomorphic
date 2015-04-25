var Ractive = require('ractive');
var wrap = require('../util/wrap');

var options = require('./options');
var filterOptions = require('./filterOptions');
var static_members = require('./static_members');
var initialise = require('./initialise');

var RactiveExpress = wrap(Ractive, options, filterOptions, static_members, initialise);

module.exports = RactiveExpress;