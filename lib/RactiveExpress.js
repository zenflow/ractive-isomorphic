var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var module_loader = require('./module_loader');
var Ractive = require('ractive');
var httpinvoke = require('httpinvoke');

var on_client; try{on_client = !!window} catch(error) {on_client = false}

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
    self._component_class_cache = {};
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
    RactiveExpress.prototype._handle_error = function(error){console.error(error);};
    RactiveExpress.prototype._bindComponentToDocument = function(params){
        //this function gets 'this' bound to each component and attached as a member named 'bindToDocument'
        var Component = this;
        var div = document.createElement('div');
        var ractive;
        try { ractive = new Component(_.assign({}, params, {el: div}));
        } catch(error){self._handle_error(error); return;}
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
        //catch sync errors [in [async] module function], and force only call cb once
        var pending = true;
        var next = function(error, Component){
            if (!pending){return;} else {pending = false;}
            if (error){cb(error); return;}
            if (on_client){
                Component.bindToDocument = self._bindComponentToDocument.bind(Component);
            }
            cb(null, Component);
        };
        try{
            if (resources[1]){
                var initializer = module_loader(resources[1]);
                initializer.bind(self)(resources[0], next);
            } else {
                cb(null, Ractive.extend({template: resources[0]}));
            }
        }catch (error){next(error);}
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
        if (component_name in self._component_class_cache){
            cb(null, self._component_class_cache[component_name]);
        } else {
            self._load_Component(component_name, function(error, Component){
                if (error){cb(error); return;}
                cb(null, self._component_class_cache[component_name] = Component);
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

RactiveExpress.prototype.Ractive = Ractive;
RactiveExpress.prototype.httpinvoke = httpinvoke;
RactiveExpress.prototype.on_client = on_client;

module.exports = RactiveExpress;