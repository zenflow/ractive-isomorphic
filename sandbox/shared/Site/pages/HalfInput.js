var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Page = require('./Page');
var template = fs.readFileSync(path.join(__dirname, 'HalfInput.html'), 'utf8');

var HalfInput = Page.extend({
	name: 'HalfInput',
	url: 'half(/:number)',
	template: template,
	twoway: false,
	onroute: function(route, is_initial){
		var self = this;
		var number = Number(route.params.number || 0);
		self.set({number: number, half: '?'});
		self.parent.set({title: self.name + ' / ' + self.parent.get('title')});
		self.api.half(number).then(function(half) {
			self.set({half: half});
			throw new Error('fake');
		});
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		console.log('...')
		if (process.browser){
			self.on('input-change', function(event){
				var number = Number(event.node.value);
				if (_.isNaN(number)){return;}
				self.parent.router.replace(self.name, {number: number});
			});
		}
	}
});

module.exports = HalfInput;