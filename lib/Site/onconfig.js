var onconfig = function(){
    var self = this;
    // handle initial `Site#onroute`
    if (process.browser && self.site.useDataScript && window._site_vm_data){
        delete window._site_vm_data;
    } else {
        self._onroute(true);
    }
};

module.exports = onconfig;