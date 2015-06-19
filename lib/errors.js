var _ = require('lodash');

var errors = {};

errors.InvalidContextError = function(message){
    this.name = 'InvalidContextError';
    this.message = message;
};
errors.InvalidContextError.prototype = _.create(Error.prototype);

errors.InvalidRouteError = function(url){
    this.name = 'InvalidRouteError';
    this.message = 'Url "' + url + '" did not match any page url.';
    this.url = url;
};
errors.InvalidRouteError.prototype = _.create(Error.prototype);

errors.NoPageMountedError = function() {
    this.name = 'NoPageMountedError';
    this.message = 'No page was mounted. Did you forget to include {{>content}} somewhere in your body template?';
};
errors.NoPageMountedError.prototype = _.create(Error.prototype);

errors.InvalidPageError = function(message){
    this.name = 'InvalidPageError';
    this.message = message;
};
errors.InvalidPageError.prototype = _.create(Error.prototype);

module.exports = errors;