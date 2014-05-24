var fs = require('fs');
var Ractive = require('ractive');
var async = require('async');
var _ = require('lodash');
var ractive_cache = {};
module.exports = function(template_filename, data, cb){
    if (data.cache){
        if (template_filename in ractive_cache){
            try {
                var ractive = ractive_cache[template_filename];
                ractive.set(data);
                cb(null, ractive.toHTML());
            } catch (error){cb(error);}
        } else {
            fs.readFile(template_filename, {encoding: 'utf8'}, function(error, template){
                if (error){cb(error); return;}
                try {
                    var ractive = ractive_cache[template_filename] = new Ractive({template: template, data: data});
                    cb(null, ractive.toHTML());
                } catch (error){cb(error);}
            });
        }
    }
    else {
        fs.readFile(template_filename, {encoding: 'utf8'}, function(error, template){
            if (error){cb(error); return;}
            try {
                var ractive = new Ractive({template: template, data: data});
                cb(null, ractive.toHTML());
            } catch(error){cb(error);}
        });
    }
};