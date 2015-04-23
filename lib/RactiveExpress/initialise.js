var _ = require('lodash');
var on_client = require('on-client');
var ObsRouter = require('obs-router');

var initialise = function(self, options, Super){
	// expose pages
	self.pages = _.clone(options.pages || self.pages || {});
	// we set self.pages already; dont override it with the Super call
	delete options.pages;

	// collect routes from pages
	var routes = {};
	_.forIn(self.pages, function(Page, page_name){
		routes[page_name] = Page.prototype.url;
	});

	// create & expose router
	self.router = new ObsRouter({
		url: options.url,
		routes: routes
	});
	delete options.url;

	//abort early if on server and no matching route
	if (!on_client && !self.router.route){return;}

	Super.call(self, options);
};

module.exports = initialise;