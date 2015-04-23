var fs = require('fs');
var path = require('path');
var RactiveExpress = require('../../../lib/RactiveExpress');
var template = fs.readFileSync(path.join(__dirname, 'Home.html'), 'utf8');

var Home = RactiveExpress.Page.extend({
	name: 'Home',
	url: '/',
	template: template
});

module.exports = Home;