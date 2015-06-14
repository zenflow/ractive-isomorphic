var _ = require('lodash');
var Ractive = require('ractive');

function wrapRactive(filterOptions, static_members){
	filterOptions = filterOptions || function(options){return options;};
	static_members = static_members || {};
	var extend = function(){
		var Parent = this;
		var args = Array.prototype.slice.call(arguments);
		if (!args.length){
			return extend.call(Parent, {});
		} else if (args.length > 1){
			return _.reduce(args, function(Parent, options){
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
			_.assign(Wrapped, Child, static_members, {
				defaults: Wrapped.prototype,
				extend: extend,
				_Parent: Child
			});
			return Wrapped;
		}
	};
	return extend.call(Ractive);
}

module.exports = wrapRactive;