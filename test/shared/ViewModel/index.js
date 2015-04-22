var fs = require('fs');
var path = require('path');
var RactiveExpress = require('../../../lib/RactiveExpress');

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
		loading_opacity: 0
	},
	onroute: function(route, params, is_initial) {
		var self = this;

		//self.root.set('status-code', 404); 		// ***
		//self.root.set('title', 'dynamically set title');  // ***

		console.log('master onroute', route, params, is_initial);

		if(self.on_client && !is_initial){ // !is_initial is only possible on_client anyways
			self.waitr.wait()();
			self.animate('loading_opacity', 1, {easing: 'easeInOut'});
			self.waitr.once('ready', function(){
				self.animate('loading_opacity', 0, {easing: 'easeInOut'});
			});
		}
	}
});

module.exports = ViewModel;