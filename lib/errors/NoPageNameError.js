var _ = require('lodash');
var NoPageNameError = function () {
    var self = this;
    self.name = 'NoPageNameError';
    self.message = 'A Site cannot accept a Page that doesn\'t have a name yet';
};
NoPageNameError.prototype = _.create(Error.prototype);
module.exports = NoPageNameError;