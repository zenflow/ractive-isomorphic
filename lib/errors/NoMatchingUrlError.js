var _ = require('lodash');
var NoMatchingUrlError = function(url){
	var self = this;
	self.name = 'NoMatchingUrlError';
	self.message = 'Url ' + (typeof url=='string'? '"'+url+'" ' : '') + 'did not match with any page';
	self.url = url;
};
NoMatchingUrlError.prototype = _.create(Error.prototype);
module.exports = NoMatchingUrlError;