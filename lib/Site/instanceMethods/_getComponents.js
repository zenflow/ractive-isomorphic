var _ = require('lodash');

var _getComponents = function(){
    var self = this;
    var components = {};
    _.forEach(self.pages, function(Page, page_name){
        components['rx-'+page_name] = Page;
    });
    return components;
};

module.exports = _getComponents;