var fs = require('fs');
var path = require('path');
var Page = require('./Page');
var template = fs.readFileSync(path.join(__dirname, 'RandomNumber.html'), 'utf8');

var RandomNumber = Page.extend({
	name: 'RandomNumber',
	url: 'random(/:number)',
	template: template,
	onroute: function(){
		var self = this;
		self.set({next_number: null});
		return self.api.random(1, 100).then(function(number){
			self.set({next_number: number});
			throw new Error('fake')
		});
	}
});

module.exports = RandomNumber;