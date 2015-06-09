var _ = require('lodash');

var InvalidContextError = function(message){
    var self = this;
    self.name = 'InvalidContextError';
    self.message = message;
};
InvalidContextError.prototype = _.create(Error.prototype);

var InvalidRouteError = function(url){
    var self = this;
    self.name = 'InvalidRouteError';
    self.message = 'Url "' + url + '" did not match any page url.';
    self.url = url;
};
InvalidRouteError.prototype = _.create(Error.prototype);

var NoPageMountedError = function() {
    var self = this;
    self.name = 'NoPageMountedError';
    self.message = 'No page was mounted. Did you forget to include {{>content}} somewhere in your body template?';
};
NoPageMountedError.prototype = _.create(Error.prototype);

var InvalidPageError = function(message){
    var self = this;
    self.name = 'InvalidPageError';
    self.message = message;
};
InvalidPageError.prototype = _.create(Error.prototype);

var errors = {
    InvalidPageError: InvalidPageError,
    InvalidContextError: InvalidContextError,
    InvalidRouteError: InvalidRouteError,
    NoPageMountedError: NoPageMountedError
};
module.exports = errors;