var _ = require('lodash');
var errors = require('../errors');
var Page = require('../Page');
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
		// check valid input
		var page_names = [];
		_.forEach(options.pages, function(_Page, i){
			if (!(_Page.prototype instanceof Page)){throw new errors.NotPageError(_Page);}
			if (!(_Page.prototype.name)){throw new errors.NoPageNameError();}
			if ( (_Page.prototype.name in (Parent.prototype.pages || {})) || _.includes(page_names, _Page.prototype.name) ){
				throw new errors.DuplicatePageNameError(_Page.prototype.name);
			}
			page_names.push(_Page.prototype.name)
		});
		// convert array to keyed object
		var pages = _.indexBy(options.pages, function(Page){return Page.prototype.name;});
		// include inherited pages
		options.pages = _.assign({}, Parent.prototype.pages || {}, pages);
	}
	return options;
};

module.exports = filterOptions;