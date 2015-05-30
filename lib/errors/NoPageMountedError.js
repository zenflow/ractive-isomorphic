var _ = require('lodash');
var NoPageMountedError = function () {
    var self = this;
    self.name = 'NoPageMountedError';
    self.message = 'No page was mounted. Did you forget to include {{>content}} somewhere in your body template?';
};
NoPageMountedError.prototype = _.create(Error.prototype);
module.exports = NoPageMountedError;