var _ = require('lodash');
var Page = require('../../Page');
var errors = require('../../errors');

var _filterOptions = function(options){
    var self = this;
    if (process.browser){
        if ('documentTemplate' in options){
            delete options.documentTemplate;
        }
        if ('bodyTemplate' in options){
            options.template = options.bodyTemplate;
            delete options.bodyTemplate;
        }
    } else {
        if ('documentTemplate' in options){
            options.template = options.documentTemplate;
            delete options.documentTemplate;
        }
        if ('bodyTemplate' in options){
            options.partials = _.assign({}, options.partials || {}, {
                body: '<div class="ri-body">'+options.bodyTemplate+'</div>'
            });
            delete options.bodyTemplate;
        }
    }
    if ('api' in options){
        // include inherited api members
        options.api = _.assign({}, self.prototype.api || {}, options.api);
    }
    if ('pages' in options){
        // check valid input
        var page_names = [];
        _.forEach(options.pages, function(_Page, i){
            if (!(typeof _Page=='function') || !(_Page.prototype instanceof Page)){
                throw new errors.InvalidPageError('Given ' + (typeof _Page) + ' is not a subclass of ri.Page.');
            }
            if (!(_Page.prototype.name)){
                throw new errors.InvalidPageError('Given Page does not have required name.');
            }
            if ( (_Page.prototype.name in (self.prototype.pages || {})) || _.includes(page_names, _Page.prototype.name) ){
                throw new errors.InvalidPageError('Given Page with name "' + _Page.prototype.name
                    + '", but a Page with that name already exists.');
            }
            page_names.push(_Page.prototype.name)
        });
        // convert array to keyed object
        var pages = _.indexBy(options.pages, function(Page){return Page.prototype.name;});
        // include inherited pages
        options.pages = _.assign({}, self.prototype.pages || {}, pages);
    }
    return options;
};

module.exports = _filterOptions;