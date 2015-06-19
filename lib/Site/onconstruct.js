var _ = require('lodash');
var Router = require('routeemitter');
var Waitr = require('waitr');
var errors = require('../errors');
var toggleTransitions = require('../util/toggleTransitions');

var onconstruct = function(options){
    var self = this;

    if (self != self.root){throw new errors.InvalidContextError('Expected Site instance to be root instance.')}

    self.site = self;

    self.constructor._filterOptions(options);

    // throw error if missing expected viewmodel data from server
    if (process.browser && self.useDataScript) {
        _.forEach(['_site_vm_data', '_page_vm_data'], function (var_name) {
            if ((typeof window[var_name]) != 'object') {
                throw new errors.InvalidContextError('Expected to find "window.' + var_name
                    + '" object. Instead found ' + (typeof window[var_name]) + '. \r\n' + 'Be sure to include '
                    + '{{{data_script}}} in your document template before the script that initialises the site.');
            }
        });
    }

    // init pages
    self.pages = _.assign({}, options.pages || self.constructor.prototype.pages);
    delete options.pages; // self._initPages already sets self.pages; dont override it with the Super call

    // init router
    var patterns = _.mapValues(self.pages, function(Page){return Page.prototype.url;});
    self.router = new Router(patterns, {
        url: options.url,
        initialEmit: false,
        patternPrefix: self.baseUrl
    });
    if (!self.router.route.isValid()){throw new errors.InvalidRouteError(self.router.route.url);}
    delete options.url;

    // init waitr & api
    self.waitr = new Waitr;
    self.waitr.wait()();
    options.api = self.waitr.wrap(options.api || self.api || {});

    // generate `components` and `partials` options
    options.components = _.assign({}, options.components || {}, self._getComponents());
    options.partials = _.assign({}, options.partials || {}, self._getPartials());

    // generate `data` option
    options.data = _.assign(
        {},
        process.browser && self.useDataScript && window._site_vm_data || {},
        options.data || {},
        {
            route: self.router.route,
            Route: self.router.Route
        }
    );

    toggleTransitions(false);
}

module.exports = onconstruct;