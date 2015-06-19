var onconfig = function(){
    var self = this;
    // handle initial `Page#onroute`
    if (process.browser && self.site.useDataScript && window._page_vm_data){
        delete window._page_vm_data;
    } else {
        self._onroute(true);
    }
};

module.exports = onconfig;