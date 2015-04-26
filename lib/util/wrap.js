// wraps ToWrap Ractive class, probably Ractive itself
var _ = require('lodash');

var wrap = function(ToWrap, initialOptions, filterOptions, static_members, initialise){
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
			var Child = ToWrap.extend.call(Parent, options);
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
			_.assign(Wrapped, Child, static_members, {
				defaults: Wrapped.prototype,
				extend: extend,
				_Parent: Child
			});
			return Wrapped;
		}
	};
	return extend.call(ToWrap, initialOptions);
};

module.exports = wrap;