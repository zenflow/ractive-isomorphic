module.exports = function(){
    var self = this;
    for (var i in arguments){
        self._filterOptions(arguments[i]);
    }
    return self._super.apply(self, arguments);
};