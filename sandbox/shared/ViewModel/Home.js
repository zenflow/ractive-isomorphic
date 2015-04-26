var fs = require('fs');
var path = require('path');
var GenericPage = require('./GenericPage');
var template = fs.readFileSync(path.join(__dirname, 'Home.html'), 'utf8');

var Home = GenericPage.extend({
	name: 'Home',
	url: '/',
	template: template
});

module.exports = Home;