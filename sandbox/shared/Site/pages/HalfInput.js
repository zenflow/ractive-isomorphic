var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Page = require('./Page');
var template = fs.readFileSync(path.join(__dirname, 'HalfInput.html'), 'utf8');

var HalfInput = Page.extend({
	name: 'HalfInput',
	url: '/half(/:number)',
	template: template,
	twoway: false,
	onroute: function(params, is_initial){
		var self = this;
		var number = Number(params.number || 0);
		self.set({number: number, half: '?'});
		self.root.set({title: self.name + ' / ' + self.root.get('title')});
		return self.api.half(number).then(function(half) {
			self.set({half: half});
			throw new Error('fake');
		});
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if (process.browser){
			self.on('input-change', function(event){
				var number = Number(event.node.value);
				if (_.isNaN(number)){return;}
				self.root.router.setRoute(self.name, {number: number});
			});
		}
	}
});

module.exports = HalfInput;