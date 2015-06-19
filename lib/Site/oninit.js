var _ = require('lodash');
var errors = require('../errors');
var toggleTransitions = require('../util/toggleTransitions');

var oninit = function(){
    var self = this;

    // throw error if no page mounted
    if (!self.page){throw new errors.NoPageMountedError;}

    if (process.browser){
        // handle following `Site#onroute`s
        self.observe('route', function(route){
            self._onroute(false);
        }, {init: false});

        // track router changes
        self.router.on('route', function(route, last_route){
            if (self.waitr.ready){
                self._changeRoute();
            }
        });
        // enable transitions on client ('complete' event fires only on client anyway)
        self.on('complete', function(){
            toggleTransitions(true);
        });
        // bind vm title to browser title
        self.observe('title', function(title){
            window.document.title = title;
        });
        // render to .ri-body once ready
        self.waitr.once('ready', function(){
            self.render(window.document.getElementsByClassName('ri-body'));
        });
    } else {
        // [Once ready] set data_script for passing vm data from server to client
        if (self.useDataScript){
            self.waitr.once('ready', function(){
                var data_script = '<script type="text/javascript">' +
                    'window._site_vm_data = ' + JSON.stringify(self.getFilteredData()) + '; ' +
                    'window._page_vm_data = ' + JSON.stringify(self.page.getFilteredData()) + '; ' +
                    '</script>';
                self.set('data_script', data_script);
            });
        }
    }

    // clean-up on teardown
    self.on('teardown', function(){
        var self = this;
        self.router.destroy();
        self.waitr.destroy();
        self.destroyed = true;
    });

    // proxy waitr events to site
    _.forEach(['waiting', 'ready'], function(name){
        self.waitr.on(name, function(){
            self.log(1, name);
            self.fire(name);
        });
    });
};

module.exports = oninit;