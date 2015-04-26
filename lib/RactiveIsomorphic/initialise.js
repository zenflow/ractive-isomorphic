var _ = require('lodash');
var on_client = require('on-client');
var ObsRouter = require('obs-router');
var Waitr = require('waitr');
var scrollTo = require('../util/scrollTo');
var toggleTransitions = require('../util/toggleTransitions');

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

	// abort early if on server and no matching route
	if (!on_client && !self.router.route){return;}

	// wrap and expose api
	self.waitr = new Waitr;
	self.api = self.waitr.wrap(options.api || self.api || {});
	delete options.api;

	// add pages to components
	options.components = _.clone(options.components || {});
	_.forEach(self.pages, function(Page, page_name){
		options.components['rx-'+page_name] = Page;
	});

	// build 'content' partial exposing page components
	options.partials = _.clone(options.partials || {});
	options.partials.content = '';
	_.forEach(self.pages, function(Page, page_name){
		options.partials.content += '{{#route=="'+page_name+'"}}'
		+'<rx-'+page_name+' route="'+page_name+'" params="{{params}}" />'
		+'{{/}}';
	});

	// assign some things to options.data
	if (on_client && self.use_data_script){
		_.forEach(['_main_vm_data', '_page_vm_data'], function(str){
			var type = typeof window[str];
			if (type != 'object'){
				throw new Error('Expected to find "window.' + str + '" object. Instead found ' + type + '. \r\n' +
				'Be sure to include {{{data_script}}} in your document template before the script that initialises ' +
				'your ractive-isomorphic viewmodel.')
			}
		});
	}

	// disable transitions
	toggleTransitions(false);

	// call super constructor
	Super.call(self, options);

	// throw error if no page mounted
	if (!self.page){throw new Error('No page was mounted. Did you forget to include {{>content}} somewhere in your website template?');}
	// throw error if user didnt call super method
	self._assertMethodsCalled();
	self.page._assertMethodsCalled();

	// clean-up on teardown
	self.on('teardown', function(){
		var self = this;
		self.router.destroy();
		self.waitr.destroy();
		self.destroyed = true;
	});

	if (on_client){
		// enable transitions on client ('complete' event fires only on client anyway)
		self.on('complete', function(){
			toggleTransitions(true);
		});
		// bind vm title to browser title
		self.observe('title', function(title){
			window.document.title = title;
		});
		// handle internal link clicks
		var super_onclick = window.document.onclick;
		window.document.onclick = function(event){
			if ((event.srcElement.tagName.toLowerCase() == 'a')
				&& (event.srcElement.origin == window.document.location.origin)
				&& (self.router.fromUrl(event.srcElement.pathname + event.srcElement.search) != null)){
				self.router.pushUrl(event.srcElement.pathname + event.srcElement.search);
				scrollTo(window.document.body, 0, 400);
				event.preventDefault();
			} else if (typeof super_onclick=='function'){
				super_onclick.apply(this, arguments);
			}
		};
		// delegate route only when waitr.ready
		var delegateRoute = function(){
			var page_changed = self.router.route != self.get('route');
			self.set({
				title: self.constructor.prototype.data.title,
				'status-code': self.constructor.prototype.data['status-code'],
				route: self.router.route,
				params: self.router.params
			});
			if (page_changed){
				self.page._assertMethodsCalled();
			}
		};
		var deferred_route_triggered = false;
		self.router.on('route', function(route, params, old_route, old_params){
			if (self.waitr.ready){
				delegateRoute();
			} else {
				if (!deferred_route_triggered){
					deferred_route_triggered = true;
					self.waitr.once('ready', function(){
						// avoid causing waiting event while still executing ready event
						process.nextTick(function(){
							deferred_route_triggered = false;
							delegateRoute();
						});
					});
				}
			}
		});
	} else {
		// [ônce ready] set data_script for passing vm data from server to client
		if (self.use_data_script){
			self.once('ready', function(){
				var main_vm_data = getFilteredVmData(self);
				var page_vm_data = getFilteredVmData(self.page);
				var data_script = '<script type="text/javascript">' +
					'window._main_vm_data = ' + JSON.stringify(main_vm_data) + '; ' +
					'window._page_vm_data = ' + JSON.stringify(page_vm_data) + '; ' +
					'</script>';
				self.set('data_script', data_script);
			});
		}
	}

	// proxy waiting and ready events from waitr
	process.nextTick(function(){
		if (self.destroyed){return;}
		self.fire(self.waitr.waiting?'waiting':'ready');
		self.waitr.on('changed', function(waiting){
			self.fire(waiting?'waiting':'ready');
		});
	});
};

function getFilteredVmData(vm){
	var data = _.clone(vm.get(''));
	delete data.route;
	delete data.params;
	_.forEach(_.keys(data), function(key){
		if ( (typeof data[key]=='function') || (_.isEqual(vm.constructor.prototype.data[key], data[key])) ){
			delete data[key];
		}
	});
	return data;
}

module.exports = initialise;