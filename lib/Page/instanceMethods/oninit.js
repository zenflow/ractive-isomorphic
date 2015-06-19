var oninit = function(){
    var self = this;
    if (process.browser){
        // handle following `Page#onroute`s
        self.observe('route', function(route){
            self._onroute(false);
        }, {init: false});
    }
};

module.exports = oninit;