/**
 * Module dependencies.
 */

console.log('begin run');

var express = require('express')
,	path = require('path')
,	streams = require('./app/streams.js')();

var favicon = require('serve-favicon')
,	logger = require('morgan')
,	methodOverride = require('method-override')
,	bodyParser = require('body-parser')
,	errorHandler = require('errorhandler');


var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('./https/privatekey.pem', 'utf8');
var certificate = fs.readFileSync('./https/certificate.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var httpsServer = https.createServer(credentials, app);
var PORT = 3000;
var SSLPORT = 3443;

console.log('starting https');
var httpslisten = httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routing
require('./app/routes.js')(app, streams);

//var server = app.listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});

var io = require('socket.io').listen(httpslisten);
/**
 * Socket.io event handling
 */
require('./app/socketHandler.js')(io, streams);
