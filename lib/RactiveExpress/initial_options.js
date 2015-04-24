var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var Waitr = require('waitr');
var helpers = require('../helpers');
var toggleTransitions = require('../util/toggleTransitions');

var initial_options = _.assign({}, helpers, {
	use_data_script: true, // this is default
	onroute: function(params, is_init){/*noop*/},
	data: _.assign({}, helpers, {
		'status-code': 200,
		title: 'ractive-express sandbox'
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
			self.observe('title', function(title){
				window.document.title = title;
			});
			// enable transitions on client ('complete' event fires only on client anyway)
			self.on('complete', function(){
				toggleTransitions(true);
			});
		}
	},
	onteardown: function(){
		var self = this;
		self.router.destroy();
		self.waitr.destroy();
	}
});

module.exports = initial_options;