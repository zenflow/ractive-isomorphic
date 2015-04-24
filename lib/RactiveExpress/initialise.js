var _ = require('lodash');
var on_client = require('on-client');
var ObsRouter = require('obs-router');
var scrollTo = require('../util/scrollTo');

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

	if (on_client){
		// attach 'route-link' event for handling internal link clicks
		// ** test to make sure this works for sub(sub?)component
		self.on('route-link *.route-link', function(event){
			self.router.pushUrl(event.node.pathname + event.node.search);
			scrollTo(window.document.body, 0, 400);
			event.original.preventDefault();
		});
		// delegate route only when waitr.ready
		var delegateRoute = function(){
			self.set({
				route: self.router.route,
				params: self.router.params
			});
		};
		var deferred_route_triggered = false;
		self.router.on('route', function(route, params, old_route, old_params){
			if (self.waitr.ready){
				delegateRoute();
			} else {
				if (!deferred_route_triggered){
					deferred_route_triggered = true;
					self.waitr.once('ready', function(){
						deferred_route_triggered = false;
						delegateRoute()
					});
				}
			}
		});
	}
};

module.exports = initialise;