var wrap = require('../util/wrap');
var Common = require('../Common');
var options = require('./options');
var filterOptions = require('./filterOptions');
var _static = require('./static');
var initialise = require('./initialise');

var RactiveIsomorphic = wrap(Common, options, filterOptions, _static, initialise);

module.exports = RactiveIsomorphic;