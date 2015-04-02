var _ = require('lodash');
var Super = require('./RactiveExpress.base');
var RactiveExpress = function(){
	var self = this;
	Super.apply(self, arguments);
};
RactiveExpress.prototype = _.create(Super.prototype);
module.exports = RactiveExpress;