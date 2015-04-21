var fs = require('fs');
var path = require('path');
//var _ = require('lodash');
var RactiveExpress = require('../../../lib/RactiveExpress');
var template = fs.readFileSync(path.join(__dirname, 'Home.html'), 'utf8');

var Home = RactiveExpress.Page.extend({
	name: 'home',
	url: '/',
	template: template,
	onroute: function(params, is_init){
		console.log('onroute home');
		var self = this;
		var number = Number(params.number || 0);
		self.set({
			number: number,
			half: '?'
		});
		self.api.half(number).then(function(half){
			self.set({half: half});
		});
	}
});

module.exports = Home;