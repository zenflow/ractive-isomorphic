var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var Waitr = require('waitr');
var helpers = require('../helpers');
var scrollTo = require('../util/scrollTo');
var toggleTransitions = require('../util/toggleTransitions');

var initial_options = _.assign({}, helpers, {
	generate_data_script: true,
	onroute: function(params, is_init){/*noop*/},
	data: _.assign({}, helpers, {
		'status-code': 200,
		title: 'ractive-express app'
	}),
	onconstruct: function(options){
		var self = this;

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
		options.data = _.assign(
			{},
			on_client && window._main_vm_data ? window._main_vm_data : {},
			options.data || {},
			{
				route: self.router.route,
				params: self.router.params
			}
		);
	},
	onconfig: function(){
		var self = this;
		toggleTransitions(false);
		// main vm route-handler
		if (on_client && window._main_vm_data){
			delete window._main_vm_data;
		} else {
			self.onroute(self.router.route, self.router.params, true);
		}
	},
	oninit: function(){
		var self = this;
		if (on_client){
			// main vm route-handler
			self.observe('params', function(params){
				self.onroute(self.router.route, self.router.params, false);
			}, {init: false});
			// enable transitions on client ('complete' event fires only on client anyway)
			self.on('complete', function(){
				toggleTransitions(true);
			});
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
		} else {
			// [ônce ready] set data_script for passing vm data from server to client
			if (self.generate_data_script){
				var setDataScript = function(){
					var main_vm_data = getFilteredVmData(self);
					var page_vm_data = getFilteredVmData(self.page);
					var data_script = '<script type="text/javascript">' +
						'window._main_vm_data = ' + JSON.stringify(main_vm_data) + '; ' +
						'window._page_vm_data = ' + JSON.stringify(page_vm_data) + '; ' +
						'</script>';
					self.set('data_script', data_script);
				};
				if (self.waitr.ready){
					setDataScript();
				} else {
					self.waitr.on('ready', setDataScript);
				}
			}
		}
	},
	onteardown: function(){
		var self = this;
		self.router.destroy();
		self.waitr.destroy();
	}
});

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

module.exports = initial_options;