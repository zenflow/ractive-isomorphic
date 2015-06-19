var Ractive = require('ractive');
var _ = require('lodash');
var path = require('path');
var staticMembers = require('./staticMembers');
var onconstruct = require('./onconstruct');
var onconfig = require('./onconfig');
var oninit = require('./oninit');
var common_all = require('../common/all');
var common_page_and_site = require('../common/page_and_site');

var Site = Ractive.extend(common_all, common_page_and_site, {
	name: 'Site',
	debug: 0,
	useDataScript: true,
	baseUrl: '/',
	data: {status: 200},
	append: false,
	staticMembers: staticMembers,
	onconstruct: onconstruct,
	onconfig: onconfig,
	oninit: oninit,
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
});

module.exports = Site;