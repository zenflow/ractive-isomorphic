var fs = require('fs');
var path = require('path');
var Page = require('./Page');
var template = fs.readFileSync(path.join(__dirname, 'Home.html'), 'utf8');

var Home = Page.extend({
	name: 'Home',
	url: '/',
	template: template
});

module.exports = Home;