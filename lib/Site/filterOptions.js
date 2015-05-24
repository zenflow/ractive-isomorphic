var _ = require('lodash');

var filterOptions = function(options, Parent){
	if (_.support.dom){
		if ('documentTemplate' in options){
			delete options.documentTemplate;
		}
		if ('bodyTemplate' in options){
			options.template = options.bodyTemplate;
			delete options.bodyTemplate;
		}
	} else {
		if ('documentTemplate' in options){
			options.template = options.documentTemplate;
			delete options.documentTemplate;
		}
		if ('bodyTemplate' in options){
			options.partials = _.assign({}, options.partials || {}, {
				body: '<div class="ri-body">'+options.bodyTemplate+'</div>'
			});
			delete options.bodyTemplate;
		}
	}
	if ('api' in options){
		// include inherited api members
		options.api = _.assign({}, Parent.prototype.api || {}, options.api);
	}
	if ('pages' in options){
		// convert array to keyed object
		var pages = _.indexBy(options.pages, function(Page){return Page.prototype.name;});
		// include inherited pages
		options.pages = _.assign({}, Parent.prototype.pages || {}, pages);
	}
	return options;
};

module.exports = filterOptions;