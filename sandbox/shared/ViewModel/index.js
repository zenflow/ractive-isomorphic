var fs = require('fs');
var path = require('path');
var RactiveExpress = require('../../../lib');

// disable ractive debug messages in log
RactiveExpress.Ractive.DEBUG = false;

var Home = require('./Home');
var HalfInput = require('./HalfInput');
var RandomNumber = require('./RandomNumber');

var document_html = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var body_html = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var navbar_html = fs.readFileSync(path.join(__dirname, 'navbar.html'), 'utf8');

var ViewModel = RactiveExpress.extend({
	documentTemplate: document_html,
	bodyTemplate: body_html,
	pages: [Home, HalfInput, RandomNumber],
	partials: {
		navbar: navbar_html
	},
	data: {
		loading_opacity: 0,
		title: 'ractive-express sandbox'
	},
	onroute: function(route, params, is_initial) {
		var self = this;
		console.log('ViewModel onroute', route, params, is_initial);
		if(self.on_client){
			self.waitr.wait()();
			self.animate('loading_opacity', 1, {easing: 'easeIn', duration: 100});
			self.waitr.once('ready', function(){
				self.animate('loading_opacity', 0, {easing: 'easeIn', duration: 100});
			});
		}
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if(self.on_client) {
			self.set('delay', self.api.getDelay());
			self.observe('delay', function (delay) {
				self.api.setDelay(delay);
			}, {init: false});
		}
	}
});

module.exports = ViewModel;