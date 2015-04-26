var Ractive = require('ractive');
var RactiveIsomorphic = require('./RactiveIsomorphic');
var Page = require('./Page');

RactiveIsomorphic.Ractive = Ractive;
RactiveIsomorphic.Promise = Ractive.Promise;
RactiveIsomorphic.Page = Page;

module.exports = RactiveIsomorphic;