var _ = require('lodash');
var Router = require('../Router');
var errors = require('../errors');
var mapObject = require('../util/mapObject');

var options = {
	append: false,
	use_data_script: true,
	data: {
		'status-code': 200,
		title: ''
	},
	onconstruct: function(options){
		var self = this;
		self._super.apply(self, arguments);
		options.data = _.assign(
			{},
			_.support.dom && self.use_data_script && window._site_vm_data || {},
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
		if (_.support.dom && self.use_data_script && window._site_vm_data){
			delete window._site_vm_data;
		} else {
			self._onroute(true);
		}
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if (_.support.dom){
			// site vm route-handler
			self.observe('params', function(params){
				self._onroute(false);
			}, {init: false});
		}
	},
	_onroute: function(is_initial){
		var self = this;
		var result = typeof self.onroute=='function' ? self.onroute(self.router.route, self.router.params, is_initial) : null;
		self._super(result);
		self.fire('route', self.router.route, self.router.params, is_initial);
	},
	_assertConstruct: function(){
		var self = this;
		// throw error if missing expected viewmodel data from server
		if (_.support.dom && self.use_data_script){
			_.forEach(['_site_vm_data', '_page_vm_data'], function(str){
				var type = typeof window[str];
				if (type != 'object'){
					throw new Error('Expected to find "window.' + str + '" object. Instead found ' + type + '. \r\n' +
					'Be sure to include {{{data_script}}} in your document template before the script that initialises ' +
					'your ractive-isomorphic website.')
				}
			});
		}
	},
	_initRouter: function(url){
		var self = this;
		self.router = new Router({
			url: url,
			routes: mapObject(self.pages, function(Page, page_name){return Page.prototype.url;})
		});
		if (!self.router.route){
			throw new errors.NoMatchingUrlError('Url "'+self.router.url+'" did not match any route');
		}
	}
};

module.exports = options;