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
var serveStatic = require('serve-static');
var path = require('path');
var fsr = require('file-stream-rotator');
var fs = require('fs');
var morgan = require('morgan');
var cors = require('cors');
var bodyparser = require('body-parser');
var request = require('request');
var _ = require('lodash');

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
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api/raw.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds
var ALLOWED_IP = configEnv[NODE_ENV].ALLOWED_IP || ["165.135.*", "127.0.0.1"];

console.log('NODE_ENV : '+ NODE_ENV );
console.log('NODE_PORT : '+ NODE_PORT );
console.log('CONTENT_API : '+ CONTENT_API );
console.log('DEPLOY_INTERVAL : '+ DEPLOY_INTERVAL );
console.log('ALLOWED_IP : '+ ALLOWED_IP );

// **********************************************************
// deploy
maps.deployMap(true);

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
		res.status(404);
		res.sendFile('404.html', { root: __dirname + '/public' });
		return;
	 }
}

// **********************************************************
// route

//api routing
app.get('/api/raw', function(req, res, next){
	maps.getRawAPI(req, res, next);
});
app.get('/api/raw.json', function(req, res, next){
	maps.getRawAPI(req, res, next);
});

app.get('/api', function(req, res, next){
	maps.getDataAPI(req, res, next);
});
app.get('/api.json', function(req, res, next){
	maps.getDataAPI(req, res, next);
});
app.get('/api/data.json', function(req, res, next){
	maps.getDataAPI(req, res, next);
});
app.get('/api/content.json', function(req, res, next){
	maps.getDataAPI(req, res, next);
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

//map thumb routing
app.use('/:mapId/thumb', function(req, res, next){
	
	console.log('\n map thumb routing ' );

	var mapId = req.params.mapId;  //req.url.replace(/\//g, '');	
	console.log('mapId : ' + mapId);
	
	console.log('req.url : ' + req.url);
	console.log('req.get host : ' + req.get('host'));
	console.log('req.originalUrl : ' + req.originalUrl);
	console.log('req.host : ' + req.host);
	console.log('req.hostname : ' + req.hostname);
	console.log('req.path : ' + req.path);
	
	if ((req.url == '/') && (req.originalUrl.slice(-1) != '/')) {		
		console.log('trailing slash redirect ');		
		res.redirect(301, req.originalUrl + '/');
		return;
	}	
	
	var isMap = maps.checkMapId(mapId);
	console.log('isMap : ' + isMap);
	
	if (isMap) {
	
		var thumbURL =  maps.getThumbUrl(mapId);
		console.log('thumbURL : ' + thumbURL);
		
		if (thumbURL) {

			console.log('thumbURL proxy pipe ');
			req.pipe(request(thumbURL)).pipe(res);
			return;	
		}
	}
	
	next(); 	
});

//map embed routing
app.use('/:mapId/embed', function(req, res, next){
	
	console.log('\n map embed routing ' );

	var mapId = req.params.mapId;  //req.url.replace(/\//g, '');	
	console.log('mapId : ' + mapId);
	
	console.log('req.url : ' + req.url);
	console.log('req.originalUrl : ' + req.originalUrl);
	console.log('req.hostname : ' + req.hostname);
	console.log('req.path : ' + req.path);
	
	if ((req.url == '/') && (req.originalUrl.slice(-1) != '/')) {		
		console.log('trailing slash redirect ');		
		res.redirect(301, req.originalUrl + '/');
		return;
	}	
	
	var isMap = maps.checkMapId(mapId);
	console.log('isMap : ' + isMap);
	
	if (isMap) {
	
		var mapType = maps.getMapType(mapId);
		console.log('mapType : ' + mapType);

		if ((mapType == 'proxy') || (mapType == 'redirect')) {
			console.log('skip embed if mapType proxy or redirect ');
			next();
		}
		else if ((mapType == 'layers') || (mapType == 'iframe')) {
		
			console.log('no app id - assume to be a map');

			var mapType = maps.getMapType(mapId);
			
			if (mapType == 'layers') {			
				console.log('layers embed sendFile ');
				res.sendFile('map-embed.html', { root: __dirname + '/public' });
				return;			
			}
			else if (mapType == 'iframe') {
				console.log('iframe embed pipe ');
				
				var iframeUrl = maps.getWebUrl(mapId);
				console.log('iframeUrl : ' + iframeUrl);
				
				iframeUrl = iframeUrl.replace(/\?$/, '');
				console.log('iframeUrl : ' + iframeUrl);
						
				if (iframeUrl.slice(-1) == '/' ){
					iframeUrl = iframeUrl.slice(0, -1);		
				}
				console.log('iframeUrl : ' + iframeUrl);			

				console.log('mapType redirect 302 ');
				res.redirect(302, iframeUrl);
				return;	
			}		
		}
	}

	next(); 	
});

//map routing
app.use('/:mapId', function(req, res, next){
	
	console.log('\n map routing ' );

	var mapId = req.params.mapId;  //req.url.replace(/\//g, '');	
	console.log('mapId : ' + mapId);
	
	console.log('req.url : ' + req.url);
	console.log('req.originalUrl : ' + req.originalUrl);
	console.log('req.hostname : ' + req.hostname);
	console.log('req.path : ' + req.path);
	
	if ((req.url == '/') && (req.originalUrl.slice(-1) != '/')) {		
		console.log('trailing slash redirect ');		
		res.redirect(301, req.originalUrl + '/');
		return;
	}	
	
	var isMap = maps.checkMapId(mapId);
	console.log('isMap : ' + isMap);
	
	if (isMap) {
	
		var mapType = maps.getMapType(mapId);
		console.log('mapType : ' + mapType);

		if ((mapType == 'proxy') || (mapType == 'redirect')) {
			console.log('proxy or redirect');
			
			var appUrl = maps.getWebUrl(mapId);
			console.log('appUrl : ' + appUrl);
			
			appUrl = appUrl.replace(/\?$/, '');
			console.log('appUrl : ' + appUrl);
					
			if (appUrl.slice(-1) == '/' ){
				appUrl = appUrl.slice(0, -1);		
			}
			console.log('appUrl : ' + appUrl);
			
			var appReqUrl = appUrl + req.url;
			console.log('appReqUrl : ' + appReqUrl);		
			
			if (mapType == "proxy") {
				console.log('mapType proxy pipe ');
				req.pipe(request(appReqUrl)).pipe(res);
				return;
			}
			else if (mapType == "redirect") {
				console.log('mapType redirect 302 ');
				res.redirect(302, appReqUrl);
				return;
			}	
		}
		else if ((mapType == 'layers') || (mapType == 'iframe')) {
		
			console.log('layers or iframe');			
			
			var mapIndex = 'map-'+ mapType +'.html';
			console.log('mapIndex : ' + mapIndex);					
			
			var serve = serveStatic(__dirname + '/public', {'index': [mapIndex]});			
			serve(req, res, next);
			return;
			
			//express.static(__dirname + '/public', {index: mapIndex});	
			
			/*
			if (mapType == 'layers') {
				console.log('send layers');
				res.sendFile('map-layers.html', { root: __dirname + '/public' });
				return;
			}
			else if (mapType == 'iframe') {
				console.log('send iframe');		
				res.sendFile('map-iframe.html', { root: __dirname + '/public' });
				return;
			}	
			*/
		}
	}

	next(); 
	
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
