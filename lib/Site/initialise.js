var _ = require('lodash');
var on_client = require('on-client');
var ObsRouter = require('obs-router');
var scrollTo = require('../util/scrollTo');
var toggleTransitions = require('../util/toggleTransitions');
var cancellableNextTick = require('../util/cancellableNextTick');

var initialise = function(self, options, Super){
	// throw error if missing expected viewmodel data from server
	if (on_client && self.use_data_script){
		_.forEach(['_site_vm_data', '_page_vm_data'], function(str){
			var type = typeof window[str];
			if (type != 'object'){
				throw new Error('Expected to find "window.' + str + '" object. Instead found ' + type + '. \r\n' +
				'Be sure to include {{{data_script}}} in your document template before the script that initialises ' +
				'your ractive-isomorphic website.')
			}
		});
	}

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

	// add pages to components
	options.components = _.clone(options.components || {});
	_.forEach(self.pages, function(Page, page_name){
		options.components['rx-'+page_name] = Page;
	});

	// build 'content' partial exposing page components
	options.partials = _.assign({}, options.partials || {}, {
		content: '<div class="ri-pages">' + _.map(self.pages, function(Page, page_name){
			return '{{#route=="' + page_name + '"}}'
				+ '<div class="ri-page ' + page_name +'">'
				+ '<rx-'+page_name+' route="'+page_name+'" params="{{params}}" />'
				+ '</div>' +
				'{{/}}';
		}).join('') + '</div>'
	});

	// disable transitions
	toggleTransitions(false);

	// call super constructor
	Super.call(self, options);

	// throw error if no page mounted
	if (!self.page){throw new Error('No page was mounted. Did you forget to include {{>content}} somewhere in your body template?');}

	// throw error if user didnt call super method
	self._assertMethodsCalled();
	self.page._assertMethodsCalled();

	var true_ready = false;
	var delayed_ready = false;
	var cancelReady = null;
	var setReady = function(ready){
		console.log('setReady 1', ready);
		true_ready = ready;
		if (cancelReady){
			cancelReady();
			cancelReady = null;
		}
		if (delayed_ready != ready){
			console.log('setReady 2', ready);
			cancelReady = cancellableNextTick(function(){
				console.log('setReady 3', ready);
				delayed_ready = ready;
				cancelReady = null;
				self.fire(delayed_ready?'ready':'waiting');
			});
		}
	};
	var trackRouteExecution = function(){
		var promises = [];
		if (self._promise){
			promises.push(self._promise);
			delete self._promise;
		}
		if (self.page._promise) {
			promises.push(self.page._promise);
			delete self.page._promise;
		}
		setReady(false);
		var always = function(){
			if ((self.get('route')==self.router.route) && (self.get('params')==self.router.params)){
				setReady(true);
			} else {
				executeRoute();
			}
		};
		Promise.all(promises).then(always, always);
	};
	var executeRoute = function(){
		if (!on_client){
			throw new Error('Something is terribly wrong... executeRoute() should not be called server-side.')
		}
		var page_changed = self.router.route != self.get('route');
		// by setting 'params', self._promise and/or/nor self.page._promise will be set
		self.set({
			title: self.constructor.prototype.data.title,
			'status-code': self.constructor.prototype.data['status-code'],
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
		self.destroyed = true;
	});

	if (on_client){
		// track route changes
		self.router.on('route', function(route, params, old_route, old_params){
			if (true_ready){
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
		// [ônce ready] set data_script for passing vm data from server to client
		if (self.use_data_script){
			self.once('ready', function(){
				var main_vm_data = getFilteredVmData(self);
				var page_vm_data = getFilteredVmData(self.page);
				var data_script = '<script type="text/javascript">' +
					'window._site_vm_data = ' + JSON.stringify(main_vm_data) + '; ' +
					'window._page_vm_data = ' + JSON.stringify(page_vm_data) + '; ' +
					'</script>';
				self.set('data_script', data_script);
			});
		}
	}
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

var isLink = function(el){return (typeof el=='object') && (el.tagName.toLowerCase() == 'a')};
var getClosestVerticalLink = function(element, deep){
	return isLink(element) && element
		|| element.parentElement && getClosestVerticalLink(element.parentElement, deep - 1);
};

module.exports = initialise;