var fs = require('fs');
var path = require('path');
var RactiveIsomorphic = require('../../../lib');

// disable ractive debug messages in log
RactiveIsomorphic.Ractive.DEBUG = false;

var Home = require('./Home');
var HalfInput = require('./HalfInput');
var RandomNumber = require('./RandomNumber');

var document_html = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var body_html = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var navbar_html = fs.readFileSync(path.join(__dirname, 'navbar.html'), 'utf8');

var ViewModel = RactiveIsomorphic.extend({
	//use_data_script: false,
	documentTemplate: document_html,
	bodyTemplate: body_html,
	pages: [Home, HalfInput, RandomNumber],
	partials: {
		navbar: navbar_html
	},
	data: {
		loading_opacity: 0,
		title: 'ractive-isomorphic sandbox'
	},
	onroute: function(route, params, is_initial) {
		var self = this;
		console.log('ViewModel onroute', route, params, is_initial);
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if(self.on_client) {
			// api delay input
			self.set('delay', self.api.getDelay());
			self.observe('delay', function (delay) {
				self.api.setDelay(delay);
			}, {init: false});

			// loading animation
			self.on('ready', function(){
				self.animate('loading_opacity', 0, {easing: 'easeIn', duration: 100});
			});
			self.on('waiting', function(){
				self.animate('loading_opacity', 1, {easing: 'easeIn', duration: 100});
			});
		}
	}
});

module.exports = ViewModel;