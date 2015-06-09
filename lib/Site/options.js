var _ = require('lodash');
var path = require('path');
var Router = require('routeemitter');
var Waitr = require('waitr');
var errors = require('../errors');
var toggleTransitions = require('../util/toggleTransitions');
var common_options_all = require('../common_options_all');
var common_options_page_site = require('../common_options_page_site');

var site_options = {
	name: 'Site',
	debug: 0,
	useDataScript: true,
	baseUrl: '/',
	data: {
		status: 200
	},
	append: false,
	onconstruct: function(options){
		var self = this;
		self.site = self;
		if (self != self.root){throw new errors.InvalidContextError('Expected Site instance to be root component.')}

		// throw error if missing expected viewmodel data from server
		if (process.browser && self.useDataScript) {
			_.forEach(['_site_vm_data', '_page_vm_data'], function (var_name) {
				if ((typeof window[var_name]) != 'object') {
					throw new errors.InvalidContextError('Expected to find "window.' + var_name
						+ '" object. Instead found ' + (typeof window[var_name]) + '. \r\n' + 'Be sure to include ' 
						+ '{{{data_script}}} in your document template before the script that initialises the site.');
				}
			});
		}

		// init pages
		self.pages = _.assign({}, options.pages || self.constructor.prototype.pages);
		delete options.pages; // self._initPages already sets self.pages; dont override it with the Super call

		// init router
		var patterns = _.mapValues(self.pages, function(Page){return Page.prototype.url;});
		self.router = new Router(patterns, {
			url: options.url,
			initialEmit: false,
			patternPrefix: self.baseUrl
		});
		if (!self.router.route.isValid()){throw new errors.InvalidRouteError(self.router.route.url);}
		delete options.url;

		// init components and partials
		options.components = _.assign({}, options.components || {}, self._getComponents());
		options.partials = _.assign({}, options.partials || {}, self._getPartials());

		// init waitr & api
		self.waitr = new Waitr;
		self.waitr.wait()();
		options.api = self.waitr.wrap(options.api || self.api || {});

		toggleTransitions(false);
		self._super.apply(self, arguments);
		options.data = _.assign(
			{},
			process.browser && self.useDataScript && window._site_vm_data || {},
			options.data || {},
			{
				route: self.router.route,
				Route: self.router.Route
			}
		);
	},
	onconfig: function(){
		var self = this;
		// handle initial `Site#onroute`
		if (process.browser && self.site.useDataScript && window._site_vm_data){
			delete window._site_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;

		// throw error if no page mounted
		if (!self.page){throw new errors.NoPageMountedError;}

		if (process.browser){
			// handle following `Site#onroute`s
			self.observe('route', function(route){
				self._onroute(false);
			}, {init: false});

			// track router changes
			self.router.on('route', function(route, last_route){
				if (self.waitr.ready){
					self._changeRoute();
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
			self.waitr.once('ready', function(){
				self.render(window.document.getElementsByClassName('ri-body'));
			});
		} else {
			// [Once ready] set data_script for passing vm data from server to client
			if (self.useDataScript){
				self.waitr.once('ready', function(){
					var data_script = '<script type="text/javascript">' +
						'window._site_vm_data = ' + JSON.stringify(self.getFilteredData()) + '; ' +
						'window._page_vm_data = ' + JSON.stringify(self.page.getFilteredData()) + '; ' +
						'</script>';
					self.set('data_script', data_script);
				});
			}
		}

		// clean-up on teardown
		self.on('teardown', function(){
			var self = this;
			self.router.destroy();
			self.waitr.destroy();
			self.destroyed = true;
		});

		// proxy waitr events to site
		_.forEach(['waiting', 'ready'], function(name){
			self.waitr.on(name, function(){
				self.log(1, name);
				self.fire(name);
			});
		});
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
					+ '<div class="ri-page ' + page_name + '"><rx-' + page_name + ' /></div>'
					+ '{{/}}';
			}).join('') + '</div>'
		}
	},
	_changeRoute: function(){
		var self = this;
		if (!process.browser){throw new Error('function _changeRoute() is server-side-only.')}
		self.log(1, 'route', self.router.route);
		self.set('route', self.router.route);
		self.page.set('route', self.router.route);
		if (self.waitr.waiting){
			self.waitr.once('ready', function(){
				if (!self.router.route.equals(self.get('route'))){
					self._changeRoute();
				}
			});
		}
	}
};

module.exports = [common_options_all, common_options_page_site, site_options];