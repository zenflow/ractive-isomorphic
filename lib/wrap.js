var _ = require('lodash');
var Ractive = require('ractive');

var wrap = function(initialOptions, filterOptions, assignStaticMembers, initialise){
	var extend = function(){
		var Parent = this;
		var args = Array.prototype.slice.call(arguments);
		if (!args.length){
			return extend.call(Parent, {});
		} else if (args.length > 1){
			return args.reduce(extend, Parent);
		} else {
			var options = args[0];
			options = filterOptions(options, Parent);
			var Child = Ractive.extend.call(Parent, options);
			var Wrapped = function(options){
				if (!(this instanceof Wrapped)){
					return new Wrapped(options);
				}
				options = filterOptions(options || {}, Child);
				initialise(this, options, Child);
			};
			Wrapped.prototype = _.create(Child.prototype);
			Wrapped.prototype.constructor = Wrapped;

			// assign static members
			_.assign(Wrapped, Child);
			Wrapped.defaults = Wrapped.prototype;
			Wrapped.extend = extend;
			Wrapped._Parent = Child;
			assignStaticMembers(Wrapped);
			return Wrapped;
		}
	};
	return extend.call(Ractive, initialOptions);
};

module.exports = wrap;