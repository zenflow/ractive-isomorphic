var Ractive = require('ractive');
var RactiveExpress = require('./RactiveExpress');
var Page = require('./Page');

RactiveExpress.Ractive = Ractive;
RactiveExpress.Promise = Ractive.Promise;
RactiveExpress.Page = Page;

module.exports = RactiveExpress;