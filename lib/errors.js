var _ = require('lodash');

var errors = {};

errors.InvalidContextError = function(message){
    self.name = 'InvalidContextError';
    self.message = message;
};
errors.InvalidContextError.prototype = _.create(Error.prototype);

errors.InvalidRouteError = function(url){
    self.name = 'InvalidRouteError';
    self.message = 'Url "' + url + '" did not match any page url.';
    self.url = url;
};
errors.InvalidRouteError.prototype = _.create(Error.prototype);

errors.NoPageMountedError = function() {
    self.name = 'NoPageMountedError';
    self.message = 'No page was mounted. Did you forget to include {{>content}} somewhere in your body template?';
};
errors.NoPageMountedError.prototype = _.create(Error.prototype);

errors.InvalidPageError = function(message){
    self.name = 'InvalidPageError';
    self.message = message;
};
errors.InvalidPageError.prototype = _.create(Error.prototype);

module.exports = errors;