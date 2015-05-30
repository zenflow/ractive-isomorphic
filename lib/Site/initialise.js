var _ = require('lodash');
var Waitr = require('waitr');
var Promise = require('ractive').Promise;
var scrollTo = require('../util/scrollTo');
var toggleTransitions = require('../util/toggleTransitions');
var getClosestVerticalLink = require('../util/getClosestVerticalLink');

var initialise = function(self, options, Super){

	// disable transitions
	toggleTransitions(false);

	// call super constructor
	Super.call(self, options);

	// throw error if no page mounted
	if (!self.page){throw new Error('No page was mounted. Did you forget to include {{>content}} somewhere in your body template?');}

	// throw error if user didnt call super method
	self._assertMethodsCalled();
	self.page._assertMethodsCalled();

	var route_waitr = new Waitr;
	route_waitr.wait()();
	_.forEach(['waiting', 'ready'], function(name){
		route_waitr.on(name, function(){self.fire(name);});
	});
	var trackRouteExecution = function(){
		var promises = [];
		if (self._promise){
			promises.push(route_waitr.wrap(self._promise));
			delete self._promise;
		}
		if (self.page._promise) {
			promises.push(route_waitr.wrap(self.page._promise));
			delete self.page._promise;
		}
		var always = function(){
			if ((self.get('route')!=self.router.route) || (self.get('params')!=self.router.params)){
				executeRoute();
			}
		};
		Promise.all(promises).then(always, always);
	};
	var executeRoute = function(){
		if (!process.browser){
			throw new Error('Something is terribly wrong... executeRoute() should not be called server-side.')
		}
		var page_changed = self.router.route != self.get('route');
		// by setting 'params', self._promise and/or/nor self.page._promise will be set
		self.set({
			title: self.constructor.prototype.data.title,
			status: self.constructor.prototype.data.status,
			route: self.router.route,
			params: self.router.params
		});
		if (page_changed){
			self.page._assertMethodsCalled();
		}
		trackRouteExecution();
	};

	// track initial route execution
	trackRouteExecution();

	// clean-up on teardown
	self.on('teardown', function(){
		var self = this;
		self.router.destroy();
		route_waitr.destroy();
		self.destroyed = true;
	});

	if (process.browser){
		// track route changes
		self.router.on('route', function(route, params, old_route, old_params){
			if (route_waitr.ready){
				executeRoute();
			}
		});
		// enable transitions on client ('complete' event fires only on client anyway)
		self.on('complete', function(){
			toggleTransitions(true);
		});
		// bind vm title to browser title
		self.observe('title', function(title){
			window.document.title = title;
		});
		// render to .ri-body once ready
		self.once('ready', function(){
			self.render(window.document.getElementsByClassName('ri-body'));
		});
		// handle internal link clicks
		var super_onclick = window.document.onclick;
		window.document.onclick = function(event){
			var link = getClosestVerticalLink(event.srcElement, 5);
			if (link && (link.origin == window.document.location.origin)
				&& (self.router.fromUrl(link.pathname + link.search) != null)){
				self.router.pushUrl(link.pathname + link.search);
				scrollTo(window.document.body, 0, 400);
				event.preventDefault();
			} else if (typeof super_onclick=='function'){
				super_onclick.apply(this, arguments);
			}
		};
	} else {
		// [Once ready] set data_script for passing vm data from server to client
		if (self.use_data_script){
			self.once('ready', function(){
				var data_script = '<script type="text/javascript">' +
					'window._site_vm_data = ' + JSON.stringify(self.getFilteredData()) + '; ' +
					'window._page_vm_data = ' + JSON.stringify(self.page.getFilteredData()) + '; ' +
					'</script>';
				self.set('data_script', data_script);
			});
		}
	}
};

module.exports = initialise;