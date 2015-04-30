var fs = require('fs');
var path = require('path');
module.exports = {
	navbar: fs.readFileSync(path.join(__dirname, 'navbar.html'), 'utf8')
};
