/*
 _______   ______   ______    .___  ___.      ___      .______     _______.
|   ____| /      | /      |   |   \/   |     /   \     |   _  \   /       |
|  |__   |  ,----'|  ,----'   |  \  /  |    /  ^  \    |  |_)  | |   (----`
|   __|  |  |     |  |        |  |\/|  |   /  /_\  \   |   ___/   \   \    
|  |     |  `----.|  `----.   |  |  |  |  /  _____  \  |  |   .----)   |   
|__|      \______| \______|   |__|  |__| /__/     \__\ | _|   |_______/    

*/

// **********************************************************

"use strict";

// **********************************************************
// require 

var http = require("http");
var https = require("https");
var url = require('url');
var express = require('express');
var path = require('path');
var fsr = require('file-stream-rotator');
var fs = require('fs');
var morgan = require('morgan');
var cors = require('cors');
var bodyparser = require('body-parser');
var request = require('request');

var package_json = require('./package.json');
var maps = require('./controllers/maps.js');

// **********************************************************
// console start

console.log('package_json.name : '+ package_json.name );
console.log('package_json.version : '+ package_json.version );
console.log('package_json.description : '+ package_json.description );

// **********************************************************
// config

var configEnv = require('./config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var NODE_PORT =  process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds
var ALLOWED_IP = configEnv[NODE_ENV].ALLOWED_IP || ["165.135.*", "127.0.0.1"];

console.log('NODE_ENV : '+ NODE_ENV );
console.log('NODE_PORT : '+ NODE_PORT );
console.log('CONTENT_API : '+ CONTENT_API );
console.log('DEPLOY_INTERVAL : '+ DEPLOY_INTERVAL );
console.log('ALLOWED_IP : '+ ALLOWED_IP );


// deploy
maps.deployMap(true);


// **********************************************************
// route
var routeTable = require('./config/route.json');

console.log('routeTable : ' + JSON.stringify(routeTable));

// **********************************************************
// app

var app = express();

app.use(cors());

// **********************************************************
// log

var logDirectory = __dirname + '/log';

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = fsr.getStream({
    filename: logDirectory + '/fccmaps.log',   
    verbose: false
});
app.use(morgan('combined', {stream: accessLogStream}))

// **********************************************************
// parser

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// **********************************************************
// validate
function checkAllowed(req, res, next) {
	
	var ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;		
	console.log('ip : ' + ip );

	//check allowed IP
	var isAllowed = false;
	if (ip != undefined) {
	
		ip = ip.replace(/ +/g, '').split(',')[0]
		for (var i = 0; i < ALLOWED_IP.length; i++) {
			var re = new RegExp('^' + ALLOWED_IP[i].replace('*', ''));
			if (ip.match(re)) {
				isAllowed = true;
			}
		 }	 
	 }
	 
	 if (isAllowed) {
		console.log('maps.pullMap isAllowed');
		next();
	 }
	 else {		
		console.log('checkAllowed error : IP not allowed');
		//res.send({'status': 'error', 'msg': 'not allowed'});
		res.status(404);
		//res.sendFile('/public/404.html');
		res.sendFile('404.html', { root: __dirname + '/public' });
		return;
	 }
}

// **********************************************************
// route

//api routing
app.get('/api', function(req, res){
	maps.getContentAPI(req, res);
});
app.get('/api.json', function(req, res){
	maps.getContentAPI(req, res);
});

//admin routing
app.use('/admin', function(req, res, next){		
	checkAllowed(req, res, next);
});
app.get('/admin/pull', function(req, res, next){
	maps.pullMap(req, res, next);
});

//static routing
app.use('/', express.static(__dirname + '/public'));

app.use('/', express.static(__dirname + '/public/map'));

//proxy routing
app.use('/:appId', function(req, res, next){
	
	//console.log('\n proxy routing ' );

	var appId = req.params.appId; //req.url.replace(/\//g, '');	
	var yrl = req.originalUrl;
	console.log('appId========================= ' + appId + '  url=' + url);
	
	
	console.log('req.url ' + req.url);
	console.log('req.get host ' + req.get('host'));
	console.log('req.originalUrl ' + req.originalUrl);
	console.log('req.host ' + req.host);
	console.log('req.path ' + req.path);
	
	
	
	
	if ((req.url == '/') && (req.originalUrl.slice(-1) != '/')) {		
		console.log('trailing slash redirect ');		
		res.redirect(301, req.originalUrl + '/');
		return;
	}
	
	
	var isMap = maps.checkMapId(appId);

	if (!isMap) {
		next();
	}
	
	var mapType = maps.getMapType(appId);

	if (mapType == 'proxy' || mapType == 'redirect') {
		var appUrl = maps.getWebUrl(appId);
		appUrl = appUrl.replace(/\?$/, '');

		//var appUrl = routeTable['amr'].url;
		//var routeType =  'proxy'; // routeTable[appId].type;
		//console.log('appUrl : ' + appUrl);
		//console.log('routeType : ' + routeType);
				
		if (appUrl.slice(-1) == '/' ){
			appUrl = appUrl.slice(0, -1);		
		}
		var routeUrl = appUrl + req.url;
		console.log('routeUrl : ' + routeUrl);
		
		
		if (mapType == "proxy") {
			req.pipe(request(routeUrl)).pipe(res);
		}
		else {	//if (mapType == "redirect")	
			res.redirect(302, routeUrl);
		}
		return;
	}
	else {
	
		console.log('no app id - assume to be a map');

		var mapType = maps.getMapType(appId);
		
		if (mapType == 'int_layers') {
			if (req.originalUrl.match(/\/embed/)) {
				console.log('sending embed')
				res.sendFile('index.html', { root: __dirname + '/public/map_templates/embed' });
			}
			else {
				res.sendFile('index.html', { root: __dirname + '/public/map_templates' });
			}
		}
		else if (mapType == 'int_iframe') {
			console.log('send iframe');
		
			res.sendFile('index-iframe.html', { root: __dirname + '/public/map_templates' });
		}
		
		
		
		return;
		
		//next(); 
	}
});

// **********************************************************
// error

app.use(function(req, res) {

	console.log('\n app.use file not found ' );
    console.error('404 file not found'); 

    res.status(404);
    //res.sendFile('/public/404.html');
	res.sendFile('404.html', { root: __dirname + '/public' });
	return;
});

app.use(function(err, req, res, next) {
    
    console.log('\n app.use error: ' + err );
    console.error(err.stack); 
    
    res.status(500);
    //res.sendFile('/public/500.html');
	res.sendFile('500.html', { root: __dirname + '/public' });
	return;
});

process.on('uncaughtException', function (err) {
    console.log('\n uncaughtException: '+ err);
    console.error(err.stack);
});

// **********************************************************
// server

var server = app.listen(NODE_PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('\n  listening at http://%s:%s', host, port);

});

// **********************************************************
// deploy
//maps.deployMap(true);

// **********************************************************
// export
module.exports = app;
