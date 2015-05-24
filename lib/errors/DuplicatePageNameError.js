var _ = require('lodash');
var DuplicatePageNameError = function (page_name) {
    var self = this;
    self.name = 'DuplicatePageNameError';
    self.message = 'A Site cannot accept multiple Pages of the same name. Page#name ' + page_name;
};
DuplicatePageNameError.prototype = _.create(Error.prototype);
module.exports = DuplicatePageNameError;