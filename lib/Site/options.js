var _ = require('lodash');
var path = require('path');
var Router = require('routeemitter');
var Waitr = require('waitr');
var errors = require('../errors');
var toggleTransitions = require('../util/toggleTransitions');
var common_options_all = require('../common_options_all');
var common_options_page_site = require('../common_options_page_site');

var site_options = {
	use_data_script: true,
	data: {
		status: 200,
		title: ''
	},
	append: false,
	onconstruct: function(options){
		var self = this;
		// throw error if missing expected viewmodel data from server
		if (process.browser && self.use_data_script) {
			_.forEach(['_site_vm_data', '_page_vm_data'], function (var_name) {
				if ((typeof window[var_name]) != 'object') {
					throw new errors.MissingVMDataError(var_name);
				}
			});
		}

		self.pages = _.assign({}, options.pages || self.constructor.prototype.pages);
		delete options.pages; // self._initPages already sets self.pages; dont override it with the Super call

		self._initRouter(options.url); // throws ri.errors.NoMatchingUrlError
		delete options.url;

		options.components = _.assign({}, options.components || {}, self._getComponents());
		options.partials = _.assign({}, options.partials || {}, self._getPartials());

		self.waitr = new Waitr;
		_.forEach(['waiting', 'ready'], function(name){
			self.waitr.on(name, function(){self.fire(name);});
		});
		options.api = self.waitr.wrap(options.api || self.api || {});

		toggleTransitions(false);

		self._super.apply(self, arguments);

		options.data = _.assign(
			{},
			process.browser && self.use_data_script && window._site_vm_data || {},
			options.data || {},
			{
				route: self.router.route,
				Route: self.router.Route
			}
		);

	},
	onconfig: function(){
		var self = this;
		self._super.apply(self, arguments);
		// site vm route-handler
		if (process.browser && self.use_data_script && window._site_vm_data){
			delete window._site_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;
		// throw error if no page mounted
		if (!self.page){throw new errors.NoPageMountedError;}

		self._super.apply(self, arguments);

		// track initial route execution
		if (!(process.browser && self.use_data_script)){
			self._trackRouteExecution();
		}

		// clean-up on teardown
		self.on('teardown', function(){
			var self = this;
			self.router.destroy();
			self.waitr.destroy();
			self.destroyed = true;
		});

		if (process.browser){
			// site vm route-handler
			self.observe('route', function(route){
				self._onroute(false);
			}, {init: false});
			// track route changes
			self.router.on('route', function(route, last_route){
				if (self.waitr.ready){
					self._executeRoute();
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
	},
	_initRouter: function(url){
		var self = this;
		var patterns = _.mapValues(self.pages, function(Page){return Page.prototype.url;});
		self.router = new Router(patterns, {url: url, initialEmit: false});
		if (!self.router.route.isValid()){
			throw new errors.NoMatchingUrlError(url);
		}
	},
	_getComponents: function(){
		var self = this;
		var components = {};
		_.forEach(self.pages, function(Page, page_name){
			components['rx-'+page_name] = Page;
		});
		return components;
	},
	_getPartials: function(){
		var self = this;
		return {
			content: '<div class="ri-pages">' + _.map(self.pages, function (Page, page_name) {
				return '{{#route.name=="' + page_name + '"}}'
					+ '<div class="ri-page ' + page_name + '">'
					+ '<rx-' + page_name + ' route="{{route}}" />'
					+ '</div>' +
					'{{/}}';
			}).join('') + '</div>'
		}
	},
	_executeRoute: function(){
		var self = this;
		if (!process.browser){
			throw new Error('Something is terribly wrong... _executeRoute() should not be called server-side.')
		}
		self.set({
			title: self.constructor.prototype.data.title,
			status: self.constructor.prototype.data.status,
			route: self.router.route
		});
		self._trackRouteExecution();
	},
	_trackRouteExecution: function(){
		var self = this;
		/*if ((!self.router.last_route) || (self.router.last_route.name != self.router.route.name)){
			self.page._assertMethodsCalled();
		}*/
		if (self.waitr.waiting){
			self.waitr.once('ready', function(){
				if (self.router.route!=self.get('route')){
					self._executeRoute();
				}
			});
		}
		if (self.router.route!=self.get('route')){throw new Error('huh?');}
	}
};

module.exports = [common_options_all, common_options_page_site, site_options];