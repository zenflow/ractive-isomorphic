// wraps ToWrap Ractive class, probably Ractive itself
var _ = require('lodash');
var Ractive = require('ractive');

var wrap = function(ToWrap, initialOptions, filterOptions, assignStaticMembers, initialise){
	ToWrap = ToWrap || Ractive;
	initialOptions = initialOptions || {};
	filterOptions = filterOptions || function(options){return options;};
	assignStaticMembers = assignStaticMembers || function(){};
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
			var Child = ToWrap.extend.call(Parent, options);
			var Wrapped = function(options){
				if (!(this instanceof Wrapped)){
					return new Wrapped(options);
				}
				options = filterOptions(options || {}, Child);
				if (initialise){
					initialise(this, options, Child);
				} else {
					Child.call(this, options)
				}
			};
			Wrapped.prototype = _.create(Child.prototype);
			Wrapped.prototype.constructor = Wrapped;

			// assign static members
			_.assign(Wrapped, Child);
			assignStaticMembers(Wrapped);
			_.assign(Wrapped, {
				defaults: Wrapped.prototype,
				extend: extend,
				_Parent: Child
			});
			return Wrapped;
		}
	};
	return extend.apply(ToWrap, initialOptions instanceof Array ? initialOptions : [initialOptions]);
};

module.exports = wrap;