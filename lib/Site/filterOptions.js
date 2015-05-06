var _ = require('lodash');
var on_client = require('on-client');

var filterOptions = function(input, Parent){
	var output = _.clone(input);
	if (on_client){
		if ('documentTemplate' in input){
			delete output.documentTemplate;
		}
		if ('bodyTemplate' in input){
			output.template = input.bodyTemplate;
			delete output.bodyTemplate;
		}
	} else {
		if ('documentTemplate' in input){
			output.template = input.documentTemplate;
			delete output.documentTemplate;
		}
		if ('bodyTemplate' in input){
			output.partials = _.clone(input.partials || {});
			output.partials.body = input.bodyTemplate;
			delete output.bodyTemplate;
		}
	}
	// inherit api members
	if ('api' in input){
		output.api = _.assign({}, Parent.prototype.api || {}, input.api);
	}
	// convert and inherit pages
	if ('pages' in input){
		//convert input array to output object
		var input_pages = {};
		_.forEach(input.pages, function(Page){
			input_pages[Page.prototype.name] = Page;
		});
		// inherit pages
		output.pages = _.assign({}, Parent.prototype.pages || {}, input_pages);
	}
	return output;
};

module.exports = filterOptions;