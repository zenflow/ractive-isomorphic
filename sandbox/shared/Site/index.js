var ractive_transitions_slide = require('ractive-transitions-slide');
var Ractive = require('ractive');
var fs = require('fs');
var path = require('path');
var ri = require('../../../lib');
var documentTemplate = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var bodyTemplate = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var pages = require('./pages');
var partials = require('./partials');

// disable ractive debug messages in log
Ractive.DEBUG = false;
Ractive.transitions.slide = ractive_transitions_slide;

var Site = ri.Site.extend({
	//use_data_script: false,
	documentTemplate: documentTemplate,
	bodyTemplate: bodyTemplate,
	pages: pages,
	partials: partials,
	data: {
		loading_opacity: 0
	},
	onroute: function(route){
		var self = this;
		self.set('title', route.name + ' / ractive-isomorphic sandbox');
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if(process.browser) {
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