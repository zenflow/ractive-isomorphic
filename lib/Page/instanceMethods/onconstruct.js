var _ = require('lodash');

var onconstruct = function(options){
    var self = this;
    self._super.apply(self, arguments);
    self.site.page = self;
    self.site.Page = self.constructor;
    options.data = _.assign(
        {},
        process.browser && self.site.useDataScript && window._page_vm_data || {},
        options.data || {},
        {
            route: self.site.router.route,
            Route: self.site.router.Route
        }
    );
};

module.exports = onconstruct;