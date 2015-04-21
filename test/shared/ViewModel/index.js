var fs = require('fs');
var path = require('path');
//var _ = require('lodash');
var RactiveExpress = require('../../../lib/RactiveExpress');

var Home = require('./Home');

var A = RactiveExpress.Page.extend({
	name: 'a',
	url: '/a',
	template: '<h4>Allo</h4>',
	onroute: function(params, is_init){
		console.log('onroute a');
	}
});
var B = RactiveExpress.Page.extend({
	name: 'b',
	url: '/b',
	template: '<h4>Bonjour</h4>',
	onroute: function(params, is_init){
		console.log('onroute b');
	}
});

var document_html = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var body_html = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var navbar_html = fs.readFileSync(path.join(__dirname, 'navbar.html'), 'utf8');

var ViewModel = RactiveExpress.extend({
	documentTemplate: document_html,
	bodyTemplate: body_html,
	pages: [Home, A, B],
	partials: {
		navbar: navbar_html
	},
	onroute: function(route, params, is_initial) {
		var self = this;
		//self.root.set('status-code', 404); 		// ***
		//self.root.set('title', 'dynamically set title');  // ***
		console.log('onroute!');
	}
});

module.exports = ViewModel;