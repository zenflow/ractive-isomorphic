require('./plugins/events');
require('./plugins/transitions');
var _ = require('lodash');
var on_client = require('on-client');
var Ractive = require('ractive');
var ObsRouter = require('obs-router');
var Waitr = require('waitr');
var wrap = require('./wrap');
var scrollTo = require('./scrollTo');
var Page = require('./Page');

// disable ractive debug messages in log
Ractive.DEBUG = false;

// back-up & disable transitions
var transitions = {};
_.assign(transitions, Ractive.transitions);
var fake_transition = function(t){t.complete();};
for (var key in Ractive.transitions){
	Ractive.transitions[key] = fake_transition;
}

var initialOptions = {
	on_client: on_client,
	onconfig: function(){
		var self = this;
		// execute general route-handler
		self.onroute(self.router.route, self.router.params, true);
	},
	oninit: function(){
		var self = this;
		if (on_client){
			// enable transitions ('complete' event fires only on client anyway)
			self.on('complete', function(){
				_.assign(Ractive.transitions, transitions);
			});
			// attach 'route-link' event for handling internal link clicks
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
			// execute general route-handler
			self.observe('params', function(params){
				self.onroute(self.router.route, self.router.params, false);
			}, {init: false});
		}
	},
	onteardown: function(){
		var self = this;
		self.router.destroy();
		self.waitr.destroy();
	},
	data: {
		on_client: on_client,
		'status-code': 200,
		title: 'ractive-express app'
	}
};

function filterOptions(input, Parent){
	var output = _.clone(input);
	if (on_client){
		if ('bodyTemplate' in input){
			output.template = input.bodyTemplate;
		}
	} else {
		if ('documentTemplate' in input){
			output.template = input.documentTemplate;
		}
		if ('bodyTemplate' in input){
			output.partials = _.clone(input.partials || {});
			output.partials.body = input.bodyTemplate;
		}
	}
	// inherit api members
	output.api = _.assign({}, Parent.prototype.api || {}, input.api || {});
	// convert and inherit pages
	if ('pages' in input){
		//convert input array to output object
		var input_pages = {};
		input.pages.forEach(function(Page){
			input_pages[Page.prototype.name] = Page;
		});
		// inherit pages
		output.pages = _.assign({}, Parent.prototype.pages || {}, input_pages);
	}
	return output;
}

function assignStaticMembers(Class){
	if (on_client){
		Class.client = client;
	} else {
		Class.server = server;
	}
}

function server(params){
	var self = this;
	var ViewModel = self.extend(params);
	return function(req, res, next){
		var vm = new ViewModel({url: req.url});
		if (!vm.router.route){
			return next();
		}
		var respond = function(){
			res.setHeader('Content-Type', 'text/html');
			res.statusCode = vm.get('status-code');
			res.end(vm.toHTML());
			vm.teardown();
		};
		if (vm.waitr.ready){
			respond();
		} else {
			vm.waitr.once('ready', respond);
		}
	}
}

function client(params){
	var self = this;
	var ViewModel = self.extend(params);
	var vm = new ViewModel({append: false});
	var render = function(){
		vm.render(window.document.body);
	};
	if (vm.waitr.ready){
		render();
	} else {
		vm.waitr.once('ready', render);
	}
	return vm;
}

function initialise(self, input_options, Super){
	var output_options = _.clone(input_options);

	// expose pages
	self.pages = _.clone(input_options.pages || self.pages || {});
	// we set self.pages already; dont override it with the Super call
	delete output_options.pages;

	// collect routes from pages
	var routes = {};
	_.forIn(self.pages, function(Page, page_name){
		routes[page_name] = Page.prototype.url;
	});

	// create & expose router
	self.router = new ObsRouter({
		url: input_options.url,
		routes: routes
	});
	delete output_options.url;

	//abort early if on server and no matching route
	if (!on_client && !self.router.route){return;}

	// wrap and expose api
	self.waitr = new Waitr;
	self.api = self.waitr.wrap(input_options.api || self.api || {});
	delete output_options.api;

	// add pages to components
	output_options.components = _.clone(input_options.components || {});
	_.forEach(self.pages, function(Page, page_name){
		output_options.components['rx-'+page_name] = Page;
	});

	// build 'content' partial exposing page components
	output_options.partials = _.clone(input_options.partials || {});
	output_options.partials.content = '';
	_.forEach(self.pages, function(Page, page_name){
		output_options.partials.content += '{{#route=="'+page_name+'"}}'
			+'<rx-'+page_name+' route="'+page_name+'" params="{{params}}" />'
			+'{{/}}';
	});

	// assign some things to options.data
	output_options.data = _.assign({}, input_options.data || {}, {
		route: self.router.route,
		params: self.router.params,
		getUrl: function(route, params){
			return self.router.toUrl(route, params);
		}
	});

	Super.call(self, output_options);
}

var RactiveExpress = wrap(initialOptions, filterOptions, assignStaticMembers, initialise);
RactiveExpress.Page = Page;
RactiveExpress.Ractive = Ractive;

module.exports = RactiveExpress;