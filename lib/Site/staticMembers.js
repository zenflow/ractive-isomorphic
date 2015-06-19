var _ = require('lodash');
var Page = require('../Page');
var errors = require('../errors');
if (!process.browser) {
	var middlewareSeries = require('middleware-flow').series;
	var serveFavicon = require('serve-favicon');
	var path = require('path');
}

var staticMembers = {
	extend: function(){
		var self = this;
		for (var i in arguments){
			self._filterOptions(arguments[i]);
		}
		return self._super.apply(self, arguments);
	},
	_filterOptions: function(options){
		var self = this;
		if (process.browser){
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
			options.api = _.assign({}, self.prototype.api || {}, options.api);
		}
		if ('pages' in options){
			// check valid input
			var page_names = [];
			_.forEach(options.pages, function(_Page, i){
				if (!(typeof _Page=='function') || !(_Page.prototype instanceof Page)){
					throw new errors.InvalidPageError('Given ' + (typeof _Page) + ' is not a subclass of ri.Page.');
				}
				if (!(_Page.prototype.name)){
					throw new errors.InvalidPageError('Given Page does not have required name.');
				}
				if ( (_Page.prototype.name in (self.prototype.pages || {})) || _.includes(page_names, _Page.prototype.name) ){
					throw new errors.InvalidPageError('Given Page with name "' + _Page.prototype.name
						+ '", but a Page with that name already exists.');
				}
				page_names.push(_Page.prototype.name)
			});
			// convert array to keyed object
			var pages = _.indexBy(options.pages, function(Page){return Page.prototype.name;});
			// include inherited pages
			options.pages = _.assign({}, self.prototype.pages || {}, pages);
		}
		return options;
	}
};

if (!process.browser){
	staticMembers.connect = function(params){
		var self = this;
		var Site = self.extend(params);
		var vm_middleware = function(req, res, next){
			var site;
			try { site = new Site({url: req.url}); }
			catch (error){
				if (error instanceof errors.InvalidRouteError){
					return next();
				} else {
					return next(error);
				}
			}
			site.once('ready', function(){
				res.setHeader('Content-Type', 'text/html');
				res.statusCode = site.get('status');
				res.end(site.toHTML());
				site.teardown();
			});
		};
		if (Site.prototype.baseUrl=='/'){
			return middlewareSeries(serveFavicon(path.join(__dirname, '..', '..', 'favicon.ico')), vm_middleware);
		} else {
			return vm_middleware;
		}

	};
}

module.exports =  staticMembers;