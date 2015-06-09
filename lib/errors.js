var _ = require('lodash');

var DuplicatePageNameError = function (page_name) {
    var self = this;
    self.name = 'DuplicatePageNameError';
    self.message = 'A Site cannot accept multiple Pages of the same name. Page#name ' + page_name;
};
DuplicatePageNameError.prototype = _.create(Error.prototype);

var MissingVMDataError = function(var_name){
    var self = this;
    self.name = 'MissingVMDataError';
    self.message = 'Expected to find "window.' + var_name + '" object. Instead found ' + (typeof window[var_name]) + '. \r\n' +
        'Be sure to include {{{data_script}}} in your document template before the script that initialises the site.';
    self.var_name = var_name;
};
MissingVMDataError.prototype = _.create(Error.prototype);

var NoMatchingUrlError = function(url){
    var self = this;
    self.name = 'NoMatchingUrlError';
    self.message = 'Url ' + (typeof url=='string'? '"'+url+'" ' : '') + 'did not match with any page';
    self.url = url;
};
NoMatchingUrlError.prototype = _.create(Error.prototype);

var NoPageMountedError = function () {
    var self = this;
    self.name = 'NoPageMountedError';
    self.message = 'No page was mounted. Did you forget to include {{>content}} somewhere in your body template?';
};
NoPageMountedError.prototype = _.create(Error.prototype);

var NoPageNameError = function () {
    var self = this;
    self.name = 'NoPageNameError';
    self.message = 'A Site cannot accept a Page that doesn\'t have a name yet';
};
NoPageNameError.prototype = _.create(Error.prototype);

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

var errors = {
    DuplicatePageNameError: DuplicatePageNameError,
    MissingVMDataError: MissingVMDataError,
    NoMatchingUrlError: NoMatchingUrlError,
    NoPageMountedError: NoPageMountedError,
    NoPageNameError: NoPageNameError,
    NotPageError: NotPageError
};
module.exports = errors;