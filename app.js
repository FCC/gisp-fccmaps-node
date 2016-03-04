
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
var package_json = require('./package.json');
var maps = require('./controllers/maps.js');

// **********************************************************
// config

var configEnv = require('./config/env.json');

var NODE_ENV = process.env.NODE_ENV || "NONE";
var NODE_PORT =  process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
var PG_DB = configEnv[NODE_ENV].PG_DB;
var PG_SCHEMA = configEnv[NODE_ENV].PG_SCHEMA;
var GEO_HOST = configEnv[NODE_ENV].GEO_HOST;
var GEO_SPACE = configEnv[NODE_ENV].GEO_SPACE;
var DRUPAL_API = configEnv[NODE_ENV].DRUPAL_API;

console.log('NODE_ENV : '+ NODE_ENV );
console.log('NODE_PORT : '+ NODE_PORT );
console.log('PG_DB : '+ PG_DB );
console.log('PG_SCHEMA : '+ PG_SCHEMA );
console.log('GEO_HOST : '+ GEO_HOST );
console.log('GEO_SPACE : '+ GEO_SPACE );
console.log('DRUPAL_API : '+ DRUPAL_API );

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


// Default date added using file pattern 


// **********************************************************
// parser

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// **********************************************************
// route

app.use('/', express.static(__dirname + '/public'));
app.use('/api-docs', express.static(__dirname + '/public/api-docs.html'));

app.param('uuid', function(req, res, next, uuid){
    // check format of uuid
    if(!serverCheck.checkUUID(uuid)){
		return serverSend.sendErr(res, 'json', 'not_found');
    } else {
        next();
    }
})

app.param('ext', function(req, res, next, ext) {
    // check format of id
	var route = req.route.path;
	//console.log('\n  route : ' + route );
	
	if (!route === '/download/:uuid.:ext') {	// skip for downloads
		if(!serverCheck.checkExt(ext)){
			return serverSend.sendErr(res, 'json', 'invalid_ext');
		} else {
			next();
		}
	}
	else {
		next();
	}
});

app.get('/', function(req, res){
  res.sendfile('./public/index.html');
});


// **********************************************************
// error

app.use(function(req, res) {

    var err_res = {};
    
    err_res.responseStatus = {
        'status': 404,
        'type': 'Not Found',
        'err': req.url +' Not Found'        
    };

    res.status(404);
    res.send(err_res);    
});

app.use(function(err, req, res, next) {
    
    //console.log('\n app.use error: ' + err );
    console.error(err.stack);
    
    var err_res = {};       
    err_res.responseStatus = {
        'status': 500,
        'type': 'Internal Server Error',
        'err': err.name +': '+ err.message      
    };  
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    res.status(500);
    res.send(err_res);
});

process.on('uncaughtException', function (err) {
    //console.log('\n uncaughtException: '+ err);
    console.error(err.stack);
});

// **********************************************************
// server

var server = app.listen(NODE_PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('\n  listening at http://%s:%s', host, port);

});

module.exports = app;

maps.mapDeploy2();


