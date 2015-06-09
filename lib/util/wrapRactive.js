var _ = require('lodash');
var Ractive = require('ractive');

function wrapRactive(initialOptions, filterOptions, static_members){
	initialOptions = initialOptions || {};
	filterOptions = filterOptions || function(options){return options;};
	static_members = static_members || {};
	var extend = function(){
		var Parent = this;
		var args = Array.prototype.slice.call(arguments);
		if (!args.length){
			return extend.call(Parent, {});
		} else if (args.length > 1){
			return args.reduce(function(Parent, options){
				return extend.call(Parent, options)
			}, Parent);
		} else {
			var options = args[0];
			options = filterOptions(options, Parent);
			var Child = Ractive.extend.call(Parent, options);
			var Wrapped = function(options){
				if (!(this instanceof Wrapped)){
					return new Wrapped(options);
				}
				options = filterOptions(options || {}, Child);
				Child.call(this, options);
			};
			Wrapped.prototype = _.create(Child.prototype);
			Wrapped.prototype.constructor = Wrapped;

			// assign static members
			assignObject(Wrapped, Child, static_members, {
				defaults: Wrapped.prototype,
				extend: extend,
				_Parent: Child
			});
			return Wrapped;
		}
	};
	return extend.apply(Ractive, initialOptions instanceof Array ? initialOptions : [initialOptions]);
}

function assignObject(obj){
	for (var i = 0; arguments[i]!==undefined; i++){
		for (var key in arguments[i]){
			if (arguments[i].hasOwnProperty(key)){
				obj[key] = arguments[i][key];
			}
		}
	}
}

module.exports = wrapRactive;