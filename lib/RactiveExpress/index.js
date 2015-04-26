var wrap = require('../util/wrap');
var Common = require('../Common');
var options = require('./options');
var filterOptions = require('./filterOptions');
var _static = require('./static');
var initialise = require('./initialise');

var RactiveExpress = wrap(Common, options, filterOptions, _static, initialise);

module.exports = RactiveExpress;