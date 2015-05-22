var _ = require('lodash');
var MissingVMDataError = function(var_name){
	var self = this;
	self.name = 'MissingVMDataError';
	self.message = 'Expected to find "window.' + var_name + '" object. Instead found ' + (typeof window[var_name]) + '. \r\n' +
	'Be sure to include {{{data_script}}} in your document template before the script that initialises the site.';
	self.var_name = var_name;
};
MissingVMDataError.prototype = _.create(Error.prototype);
module.exports = MissingVMDataError;