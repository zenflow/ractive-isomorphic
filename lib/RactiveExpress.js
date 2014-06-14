var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var module_loader = require('./module_loader');
var Ractive = require('ractive');
var httpinvoke = require('httpinvoke');

var on_client; try {on_client = !!window} catch(error) {on_client = false;}

Ractive.transitions = require('./plugins/transitions/index');
Ractive.events = require('./plugins/events/index');

var RactiveExpress = function(_options){
    var self = this;
    self._options = _options || {};
    if (!('cache' in self._options)){
        self._options.cache = false;
    }
    if (!('templates' in self._options)){
        self._options.templates = on_client ? '/views' : path.join(process.cwd(), 'views');
    }
    self._partial_cache = {};
    self._component_cache = {};
    if (on_client){

    } else {
        if (!('recycle' in self._options)){self._options.recycle = false;}
        if (self._options.recycle){
            self._component_instances = {};
        }
        self.renderFile = self.renderFile.bind(self);
    }
};

if (on_client){
    RactiveExpress.prototype._fetch_resource = function(filename, cb){
        var self = this;
        httpinvoke(path.join(self._options.templates, filename), 'GET', function(error, resource, statusCode){
            if (error){cb(error); return;}
            if (statusCode!=200){cb(null, false); return;}
            cb(null, resource);
        });
    };
    RactiveExpress.prototype.bindPage = function(Component, params){
        var div = document.createElement('div');
        var ractive = new Component(_.assign({}, params, {el: div}));
        // give ractive a chance to render properly, before transplanting it into the dom
        setTimeout(function(){
            var div_body = div.getElementsByTagName('body')[0];
            var active_body = document.getElementsByTagName('body')[0];
            active_body.innerHTML = '';
            var i = 0;
            var child;
            while (child = div_body.childNodes[i]){
                if (child.tagName!='SCRIPT'){
                    active_body.appendChild(child);
                }
                i++;
            }
        }, 0);
        return ractive;
    };
} else {
    RactiveExpress.prototype._fetch_resource = function(filename, cb){
        var self = this;
        var _filename = path.join(self._options.templates, filename);
        fs.exists(_filename, function(exists){
            if (!exists){cb(null, false); return}
            fs.readFile(_filename, {encoding: 'utf8'}, function(error, resource){
                if (error){cb(error); return;}
                cb(null, resource);
            });
        });
    };
    RactiveExpress.prototype.renderFile = function(component_filename, data, cb){
        var self = this;
        var component_name = path.basename(component_filename, '.html');
        if (self._options.recycle){
            if (component_name in self._component_instances){
                var component = self._component_instances[component_name];
                try {
                    component.set(data);
                } catch(error){cb(error); return;}
                cb(null, component.toHTML());
            } else {
                self.getComponent(component_name, function(error, Component){
                    if (error){cb(error); return;}
                    var component;
                    try {
                        component = self._component_instances[component_name] = new Component({data: data});
                    } catch(error){cb(error); return;}
                    cb(null, component.toHTML());
                });
            }
        } else {
            self.getComponent(component_name, function(error, Component){
                if (error){cb(error); return;}
                var component;
                try {
                    component = new Component({data: data});
                } catch(error){cb(error); return;}
                cb(null, component.toHTML());
            });
        }
    };
}
RactiveExpress.prototype._load_partial = function(partial_name, cb){
    var self = this;
    self._fetch_resource(partial_name+'.html', function(error, partial){
        if (error){cb(error); return;}
        if (!partial){cb(new Error('template for partial \''+partial_name+'\' does not exist')); return;}
        cb(null, partial);
    });
};
RactiveExpress.prototype._load_Component = function(component_name, cb){
    var self = this;
    async.parallel([
        function(cb){ self._fetch_resource(component_name+'.html', cb); },
        function(cb){ self._fetch_resource(component_name+'.js', cb); }
    ], function(error, resources){
        if (error){cb(error); return;}
        if (!resources[0]){cb(new Error('template for component \''+component_name+'\' does not exist')); return;}
        if (typeof resources[1]=='string'){
            var resolved = false;
            var next = function(error, Component){
                if (resolved){if (error){throw error;} else {return;}}
                resolved = true;
                cb(error, Component);
            };
            //the following bit of code will cause unreported uncaught errors if run in this call stack
            setTimeout(function(){
                var pseudo_module;
                try {pseudo_module = module_loader(resources[1]);}
                catch (error) {next(error); return;}
                try {
                    pseudo_module.bind(self)(resources[0], function(error, Component){
                        if (error){next(error); return;}
                        try {next(null, Component);}
                        catch (error){next(error);}
                    });
                } catch (error){next(error);}
            }, 0);
        } else {
            cb(null, Ractive.extend({template: resources[0]}));
        }
    });
};
RactiveExpress.prototype.getPartial = function(partial_name, cb){
    var self = this;
    if (self._options.cache){
        if (partial_name in self._partial_cache){
            cb(null, self._partial_cache[partial_name]);
        } else {
            self._load_partial(partial_name, function(error, partial){
                if (error){cb(error); return;}
                cb(null, self._partial_cache[partial_name] = partial);
            });
        }
    } else {
        self._load_partial(partial_name, cb);
    }
};
RactiveExpress.prototype.getPartials = function(partial_names, cb){
    var self = this;
    async.map(partial_names, self.getPartial.bind(self), function(error, partials){
        if (error){cb(error); return;}
        cb(null, _.zipObject(partial_names, partials));
    });
};
RactiveExpress.prototype.getComponent = function(component_name, cb){
    var self = this;
    if (self._options.cache){
        if (component_name in self._component_cache){
            cb(null, self._component_cache[component_name]);
        } else {
            self._load_Component(component_name, function(error, Component){
                if (error){cb(error); return;}
                cb(null, self._component_cache[component_name] = Component);
            });
        }
    } else {
        self._load_Component(component_name, cb);
    }
};
RactiveExpress.prototype.getComponents = function(component_names, cb){
    var self = this;
    async.map(component_names, self.getComponent.bind(self), function(error, Components){
        if (error){cb(error); return;}
        cb(null, _.zipObject(component_names, Components));
    });
};
RactiveExpress.prototype.getResources = function(partial_names, component_names, cb){
    var self = this;
    async.parallel([function(cb){
        self.getPartials(partial_names, cb);
    },function(cb){
        self.getComponents(component_names, cb);
    }],function(error, results){
        if (error){cb(error); return;}
        cb(null, results[0], results[1])
    });
};
RactiveExpress.prototype.initRouter = function(page, makeTitle){
    var self = this;
    var router = self.on_client ? require('browser-router') : null;
    var queryObjToStr = function (obj){
        var str = '';
        for (var key in obj){
            str += encodeURIComponent(key) + (obj[key]?'='+encodeURIComponent(obj[key]):'') + '&';
        }
        return str.slice(0, -1)
    };
    var queryStrToObj = function(str){
        var query = {};
        str.split('&').forEach(function(str){
            if (str){
                var param = str.split('=').map(decodeURIComponent);
                query[param[0]] = param[1] || '';
            }
        });
        return query;
    };
    var isQueryEqual = function(a, b){
        if ((typeof a!='object')||(typeof b!='object')){return false;}
        var keys = _.keys(a);
        if (!_.isEqual(_.keys(b), keys)){return false;}
        for (var i = 0; i < keys.length; i++){
            if (a[keys[i]]!==b[keys[i]]){return false;}
        }
        return true;
    };
    if (!page.get('route.url')){
        if (self.on_client){
            page.set('route.url', document.location.pathname + document.location.search)
        } else {
            throw new Error('route.url not set');
        }
    }
    if (!page.get('route.mount')){page.set('route.mount', '/');}
    var mount = page.get('route.mount');
    var url = page.get('route.url');
    if (url.slice(0, mount.length)!=mount){throw new Error('route.url must be within route.mount');}
    page.observe('route.url', function(url){
        var route = page.get('route');
        var parts = url.split('?');
        var path_str = parts[0];
        var query_str = parts[1] || '';
        var path = path_str.slice(route.mount.length).split('/');
        var query = queryStrToObj(query_str);
        if (_.isEqual(path, route.path)){path = route.path;}
        if (isQueryEqual(query, route.query)){query = route.query;}
        var title = makeTitle({url: url, mount: route.mount, path: path, query: query});
        page.set({'route.path': path, 'route.query': query, title: title});
        if (self.on_client && ((router.getPath() != path_str) || (queryObjToStr(router.getParams()) != query_str))){
            router.route(path_str, query, title);
        }
    });
    page.observe('route.path route.query', function(){
        var path_str = page.get('route.mount') + page.get('route.path').join('/');
        var query_str = queryObjToStr(page.get('route.query'));
        page.set('route.url', path_str+(query_str?'?'+query_str:''));
    });
    page.on('nav', function(event){
        var route = page.get('route');
        var link = event.node;
        if (link.target.toUpperCase()=='_BLANK'){return;}
        if (link.origin!=document.location.origin){return;}
        if (link.pathname.slice(0, route.mount.length)!=route.mount){return;}
        page.set('route.url', link.pathname + link.search);
        event.original.preventDefault();
    });
    if (self.on_client){
        router.onRoute(function(path, query, title){
            var query_str = queryObjToStr(query);
            var url = path + (query_str?'?'+query_str:'');
            page.set('route.url', url);
        });
    }
}
RactiveExpress.prototype.Ractive = Ractive;
RactiveExpress.prototype.httpinvoke = httpinvoke;
RactiveExpress.prototype.on_client = on_client;

module.exports = RactiveExpress;