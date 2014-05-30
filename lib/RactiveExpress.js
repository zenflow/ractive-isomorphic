var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var eval_module = require('./eval_module');
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
        self._options.templates = on_client ? '/templates' : path.join(process.cwd(), 'public/templates')
    }
    self._partial_cache = {};
    self._component_class_cache = {};
    if (on_client){
        if (!('el' in self._options)){
            self._options.el = false;
        }
        if (!('data' in self._options)){
            self._options.data = {};
        }
        if (!self._options.view){self._handle_error(new Error('A \'view\' must be specified in the options')); return;}
        self.getComponent(self._options.view, function(error, Component){
            // pretty this up u drunk stoner, & allow element option
            if (error){self._handle_error(error); return;}
            var active_body = document.getElementsByTagName('body')[0];
            for (var child = active_body.firstChild; child; child = active_body.firstChild){
                active_body.removeChild(child);
            }
            var div = document.createElement('div');
            var ractive; try {ractive = new Component({el: div, data: self._options.data}); } catch(error){self._handle_error(error); return;}
            var div_body = div.getElementsByTagName('body')[0];
            for (child = div_body.firstChild; child; child = div_body.firstChild){
                if (child.tagName!='SCRIPT'){
                    active_body.appendChild(child);
                } else {
                    div_body.removeChild(child);
                }
            }
            self.ractive = ractive;
        });
    } else {
        self._component_object_cache = {};
        self.renderFile = self.renderFile.bind(self);
    }
};

if (on_client){
    RactiveExpress.prototype._handle_error = function(error){console.error(error);};
    RactiveExpress.prototype._load_partial = function(partial_name, cb){
        var self = this;
        httpinvoke(path.join(self._options.templates, partial_name+'.html'), 'GET', function(error, partial, statusCode){
            if (error){cb(error); return;}
            if (statusCode!=200){cb(new Error('http status code '+statusCode+' for partial "'+partial_name+'"')); return;}
            cb(null, partial);
        });
    };
    RactiveExpress.prototype._load_Component_data = function(component_name, cb){
        var self = this;
        httpinvoke(path.join(self._options.templates, component_name+'.html'), 'GET', function(error, template, statusCode){
            if (error){cb(error); return;}
            if (statusCode!=200){cb(new Error('http status code '+statusCode+' for component "'+component_name+'" template')); return;}
            httpinvoke(path.join(self._options.templates, component_name+'.js'), 'GET', function(error, js, statusCode){
                if (error){cb(error); return;}
                if (statusCode==404){cb(null, {template: template}); return;}
                if (statusCode!=200){cb(new Error('http status code '+statusCode+' for component "'+component_name+'" js')); return;}
                cb(null, {template: template, js: js});
            });
        });
    };
} else {
    RactiveExpress.prototype._load_partial = function(partial_name, cb){
        var self = this;
        fs.readFile(path.join(self._options.templates, partial_name+'.html'), {encoding: 'utf8'}, cb);
    };
    RactiveExpress.prototype._load_Component_data = function(component_name, cb){
        var self = this;
        fs.readFile(path.join(self._options.templates, component_name+'.html'), {encoding: 'utf8'}, function(error, template){
            if (error){cb(error); return;}
            fs.exists(path.join(self._options.templates, component_name+'.js'), function(js_exists){
                if (!js_exists){cb(null, {template: template}); return;}
                fs.readFile(path.join(self._options.templates, component_name+'.js'), {encoding: 'utf8'}, function(error, js){
                    if (error){cb(error); return;}
                    cb(null, {template: template, js: js});
                });
            });
        });
    };
    RactiveExpress.prototype.renderFile = function(component_filename, data, cb){
        var self = this;
        var component_name = path.basename(component_filename, '.html');
        if (self._options.cache){
            if (component_name in self._component_object_cache){
                var component = self._component_object_cache[component_name];
                try {
                    component.set(data);
                } catch(error){cb(error); return;}
                cb(null, component.toHTML());
            } else {
                self.getComponent(component_name, function(error, Component){
                    if (error){cb(error); return;}
                    var component;
                    try {
                        component = self._component_object_cache[component_name] = new Component({data: data});
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
RactiveExpress.prototype._load_Component = function(component_name, cb){
    var self = this;
    self._load_Component_data(component_name, function(error, Component_data){
        if (error){cb(error); return;}
        if (Component_data.js){
            var module;
            try {
                module = eval_module(Component_data.js);
            } catch(error){cb(error); return;}
            //catch any sync errors in [async] module function, but only call cb once
            var pending = true;
            var next = function(error, Component){
                if (!pending){return;}
                pending = false;
                cb(error, Component);
            };
            try {
                module.bind(self)(Component_data.template, next);
            } catch(error){next(error);}
        } else {
            var Component;
            try {
                Component = Ractive.extend({template: Component_data.template});
            } catch(error){cb(error); return;}
            cb(null, Component);
        }
    })
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