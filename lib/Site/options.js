var _ = require('lodash');
var path = require('path');
var Promise = require('ractive').Promise;
var Router = require('obs-router');
var Waitr = require('waitr');
var errors = require('../errors');
var scrollTo = require('../util/scrollTo');
var toggleTransitions = require('../util/toggleTransitions');
var getClosestVerticalLink = require('../util/getClosestVerticalLink');
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

		self._initWaitr();

		toggleTransitions(false);

		self._super.apply(self, arguments);

		options.data = _.assign(
			{},
			process.browser && self.use_data_script && window._site_vm_data || {},
			options.data || {},
			{
				route: self.router.route,
				params: self.router.params
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
		self._super.apply(self, arguments);
		// clean-up on teardown
		self.on('teardown', function(){
			var self = this;
			self.router.destroy();
			self.waitr.destroy();
			self.destroyed = true;
		});

		if (process.browser){
			// site vm route-handler
			self.observe('params', function(params){
				self._onroute(false);
			}, {init: false});
			// track route changes
			self.router.on('route', function(route, params, old_route, old_params){
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
	},
	_onroute: function(is_initial){
		var self = this;
		var result = typeof self.onroute=='function' ? self.onroute(self.router.route, self.router.params, is_initial) : null;
		self._super(result);
		self.fire('route', self.router.route, self.router.params, is_initial);
	},
	_initRouter: function(url){
		var self = this;
		self.router = new Router({
			url: url,
			routes: _.mapValues(self.pages, function(Page, page_name){return Page.prototype.url;})
		});
		if (!self.router.route){
			throw new errors.NoMatchingUrlError(self.router.url);
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
				return '{{#route=="' + page_name + '"}}'
					+ '<div class="ri-page ' + page_name + '">'
					+ '<rx-' + page_name + ' route="' + page_name + '" params="{{params}}" />'
					+ '</div>' +
					'{{/}}';
			}).join('') + '</div>'
		}
	},
	_initWaitr: function(){
		var self = this;
		self.waitr = new Waitr;
		self.waitr.wait()();
		_.forEach(['waiting', 'ready'], function(name){
			self.waitr.on(name, function(){self.fire(name);});
		});
	},
	_executeRoute: function(){
		var self = this;
		if (!process.browser){
			throw new Error('Something is terribly wrong... _executeRoute() should not be called server-side.')
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
		self._trackRouteExecution();
	},
	_trackRouteExecution: function(){
		var self = this;
		var promises = [];
		if (self._promise){
			promises.push(self.waitr.wrap(self._promise));
			delete self._promise;
		}
		if (self.page._promise) {
			promises.push(self.waitr.wrap(self.page._promise));
			delete self.page._promise;
		}
		var always = function(){
			if ((self.get('route')!=self.router.route) || (self.get('params')!=self.router.params)){
				self._executeRoute();
			}
		};
		Promise.all(promises).then(always, always);
	}
};

module.exports = [common_options_all, common_options_page_site, site_options];