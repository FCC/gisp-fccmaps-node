/*
 _______   ______   ______    .___  ___.      ___      .______     _______.
 |   ____| /      | /      |   |   \/   |     /   \     |   _  \   /       |
|  |__   |  ,----'|  ,----'   |  \  /  |    /  ^  \    |  |_)  | |   (----`
|   __|  |  |     |  |        |  |\/|  |   /  /_\  \   |   ___/   \   \    
|  |     |  `----.|  `----.   |  |  |  |  /  _____  \  |  |   .----)   |   
|__|      \______| \______|   |__|  |__| /__/     \__\ | _|   |_______/    

*/

// **********************************************************

'use strict';


// **********************************************************
//require
var http = require('http');
var https = require('https');
var fs = require('fs-extra');

var request = require('request');

// **********************************************************
//config

var configEnv = require('../config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds

// **********************************************************
// routeTable
var routeTable = require('../config/route.json');

// **********************************************************

var contentJson = [];
var newDataJson, oldDataJson;
var mapDirPath = './public/map';
var forceLock = false;


function deployMap(repeat) {
	console.log('\n deployMap :  '  );
	try {				
						
		var contentProtocol = https;
		if (CONTENT_API.indexOf('http://') == 0) {
			contentProtocol = http;
			//console.log('contentProtocol : http ' );
		}		
		console.log('CONTENT_API : ' + CONTENT_API);
		
		contentProtocol.get(CONTENT_API, function(res) {
			var data = '';
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on('end', function() {
		
				oldDataJson = contentJson;
				
				var newData = data;
				newData = newData.replace(/\\n/g, '');
				newData = newData.replace(/\\r/g, '');
		
				newDataJson = JSON.parse(newData);				

				console.log('CONTENT_API data received.');

				if (JSON.stringify(newDataJson) != JSON.stringify(oldDataJson)) {
				
					console.log('newDataJson != oldDataJson');
					contentJson = newDataJson;
				}
				else {
					console.log('no change - newDataJson == oldDataJson');
				}		
			});			
		});

		if (repeat) {
			setTimeout(function() {
				deployMap(true);
			}, DEPLOY_INTERVAL);
			console.log((new Date()).toString() + ' wait...');
		}
		else {
			console.log('one time run to pull');
		}

	}
	catch (e) {
		console.error('Exception in deployMap:'+e);
		if (repeat) {
			console.log('resumme deployMap loop');
			setTimeout(function() {
				deployMap(true);
			}, DEPLOY_INTERVAL);
		}
	}
}

// **********************************************************
// resp

function getContentAPI(req, res) {
	res.json(contentJson);
}

function pullMap(req, res) {
	
	console.log('\n pullMap ');
	
	try {
			deployMap(false);		
			res.send({'status': 'ok', 'msg': 'Pull Map Requested'});	
			return;		
	}
	catch (e) {
		console.error('Exception in pullMap: ' + e);
		res.status(500);
		res.send({'status': 'error', 'msg': 'Pull Map Exception: ' + e});
	}	
}

function checkMapId(mapId) {
console.log('check map id ' + mapId);
	for (var i = 1; i < contentJson.length; i++) {
		var map_unique = '';
		if (contentJson[i].fields.field_map_unique && contentJson[i].fields.field_map_unique.und && contentJson[i].fields.field_map_unique.und[0].value) {
			map_unique = contentJson[i].fields.field_map_unique.und[0].value;
		}

		if (map_unique == mapId) {
			return true;
		}
	
	}
	
	return false;
}

function getMapType(mapId) {
	var map_type = '';
	for (var i = 1; i < contentJson.length; i++) {
		var map_unique = '';
		if (contentJson[i].fields.field_map_unique && contentJson[i].fields.field_map_unique.und && contentJson[i].fields.field_map_unique.und[0].value) {
			map_unique = contentJson[i].fields.field_map_unique.und[0].value;
		}

		if (map_unique == mapId) {
			if (contentJson[i].fields.field_map_type && contentJson[i].fields.field_map_type.und && contentJson[i].fields.field_map_type.und[0].value) {
				map_type = contentJson[i].fields.field_map_type.und[0].value;
			}
		}
	}
	return map_type;
}

function getWebUrl(mapId) {
	var webUrl = '';
	for (var i = 1; i < contentJson.length; i++) {
		var map_unique = '';
		if (contentJson[i].fields.field_map_unique && contentJson[i].fields.field_map_unique.und && contentJson[i].fields.field_map_unique.und[0].value) {
			map_unique = contentJson[i].fields.field_map_unique.und[0].value;
		}
		if (map_unique == mapId) {
			if (contentJson[i].webUrl) {
				webUrl = contentJson[i].webUrl;
			}
		}
	}
	return webUrl;
}


// **********************************************************
// export

module.exports.deployMap = deployMap;
module.exports.getContentAPI = getContentAPI;
module.exports.pullMap = pullMap;
module.exports.checkMapId = checkMapId;
module.exports.getMapType = getMapType;
module.exports.getWebUrl = getWebUrl;