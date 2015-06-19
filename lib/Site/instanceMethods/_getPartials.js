var _ = require('lodash');

var _getPartials = function(){
    var self = this;
    return {
        content: '<div class="ri-pages">' + _.map(self.pages, function (Page, page_name) {
            return '{{#route.name=="' + page_name + '"}}'
                + '<div class="ri-page ' + page_name + '"><rx-' + page_name + ' /></div>'
                + '{{/}}';
        }).join('') + '</div>'
    }
};

module.exports = _getPartials;