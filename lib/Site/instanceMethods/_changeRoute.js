var _changeRoute = function(){
    var self = this;
    if (!process.browser){throw new Error('function _changeRoute() is client-side-only.')}
    self.log(1, 'route', self.router.route);
    self.set('route', self.router.route);
    self.page.set('route', self.router.route);
    if (self.waitr.waiting){
        self.waitr.once('ready', function(){
            if (!self.router.route.equals(self.get('route'))){
                self._changeRoute();
            }
        });
    }
};

module.exports = _changeRoute;