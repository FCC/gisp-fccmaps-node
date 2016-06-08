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
// config

var configEnv = require('./config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var NODE_PORT =  process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API;
var ALLOWED_IP = configEnv[NODE_ENV].ALLOWED_IP || ["165.135.*", "127.0.0.1"];

console.log('NODE_ENV : '+ NODE_ENV );
console.log('NODE_PORT : '+ NODE_PORT );
console.log('CONTENT_API : '+ CONTENT_API );
console.log('ALLOWED_IP : '+ ALLOWED_IP );

var routetable = {
	"c2h": {
		"name": "c2h",
		"route": "connect2health",
		"host": "https://apps2.fcc.gov/connect2health/"                                      
	},
	"amr": {
		"name": "amr",
		"route": "connect2health",
		"host": "http://amr-web-node-dev.us-west-2.elasticbeanstalk.com/"                                      
	}
};

console.log(routetable);

// **********************************************************
// console start

console.log('package_json.name : '+ package_json.name );
console.log('package_json.version : '+ package_json.version );
console.log('package_json.description : '+ package_json.description );

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
// route

app.use('/', express.static(__dirname + '/public'));

app.get('/api', function(req, res){
	maps.getContentAPI(req, res);
});
app.get('/api.json', function(req, res){
	maps.getContentAPI(req, res);
});

app.get('/admin/pull', function(req, res){
    var ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

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
		maps.pullDrupal(req, res);
	 }
	 else {		
		console.log("IP not allowed");
		//res.send({"status": "error", "msg": "not allowed"});
		res.sendFile('./public/404.html');		
	 }
	 
});

//proxy routing
app.use('/apps', function(req, res){

	var appid = req.url.replace(/\//g, '');	
	console.log(appid);
	
	if (routetable[appid]) {
		var url = routetable[appid].host;
		console.log(url);
		req.pipe(request(url)).pipe(res);
	}
	else {
		console.log('no id');
		res.sendFile('./public/404.html');
	}
	
	
  //req.pipe(request(url)).pipe(res);
//console.log(req.url);

});

app.use('/', express.static(__dirname + '/public/map'));


// **********************************************************
// error

app.use(function(req, res) {

console.log('\napp.use file not found ' );
    console.error('404 file not found'); 

    res.status(404);
    res.sendFile('./public/404.html');
});

app.use(function(err, req, res, next) {
    
    console.log('\n app.use error: ' + err );
    console.error(err.stack); 
    
    res.status(500);
    res.sendFile('./public/500.html');
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

maps.mapDeploy("repeat");

module.exports = app;



