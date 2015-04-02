// test/server/index.js
var path = require('path');
var http = require('http');
var connect = require('connect');
var logger = require('morgan');
var serveStatic = require('serve-static');

var app = connect();
app.use(logger('dev'));
app.use(serveStatic(path.join(__dirname, '../client/build')));

var port = parseInt(process.env.PORT, 10) || 3000;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function(){
	console.log('Listening on port ' + port);
});