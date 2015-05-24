var _ = require('lodash');
var NotPageError = function (NotPage) {
    var self = this;
    self.name = 'NotPageError';
    self.message = 'Expected child class of ri.Page. Got ' + (
            typeof NotPage == 'function'
                ? 'Class with Class#name "' + NotPage.prototype.name + '" '
                : typeof NotPage
        );
};
NotPageError.prototype = _.create(Error.prototype);
module.exports = NotPageError;