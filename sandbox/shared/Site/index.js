var fs = require('fs');
var path = require('path');
var ri = require('../../../lib');
var documentTemplate = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var bodyTemplate = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var pages = require('./pages');
var partials = require('./partials');

// disable ractive debug messages in log
ri.Ractive.DEBUG = false;

var Site = ri.Site.extend({
	//use_data_script: false,
	documentTemplate: documentTemplate,
	bodyTemplate: bodyTemplate,
	pages: pages,
	partials: partials,
	data: {
		loading_opacity: 0,
		title: 'ractive-isomorphic sandbox'
	},
	onroute: function(route, params, is_initial) {
		var self = this;
		console.log('Site onroute', route, params, is_initial);
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if(self.on_client) {
			// api delay input
			self.set('delay', self.api.getDelay());
			self.observe('delay', function (delay) {
				self.api.setDelay(delay);
			});

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

module.exports = Site;