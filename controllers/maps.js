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

//var async = require('async');

// **********************************************************
//config

var configEnv = require('../config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds

// **********************************************************

var contentJson = [];
var newDataJson, oldDataJson;
var mapDirPath = './public/map';
var forceLock = false;

function createMap(mm) { 
	//return function(callback) {

		var nid = mm.nid;
		var vid = mm.vid;
		var map_repository_title = '';
		var map_repository_url = '';
		var map_page_url = '';
		var map_page_title = '';
		
		//see if there is map_page_url
		if ( !(mm.fields.field_map_page_url.und && mm.fields.field_map_page_url.und[0].url)) {
			//callback(new Error('map_page_url undefined'));
			return;
		}
		
		//see if map type is int_layers
		var map_type = '';
		if (mm.fields.field_map_type && mm.fields.field_map_type.und) {
			map_type = mm.fields.field_map_type.und[0].value;
		}
		if (map_type != 'int_layers') {
			console.log('map_type invalid');
			//callback(new Error('map_type invalid '));
			//return;
		}
		
		//compare with oldDataJson to see if they are different
		var map_new = is_new(mm);
		
		if (!map_new) {
			console.log('map_new not new');
			//callback(new Error('map_new not new '));
			return;
		}
		
		if (mm.fields.field_map_page_url.und) {
		
			//console.log('field_map_page_url.und : ' + JSON.stringify(mm.fields.field_map_page_url.und));
		
			map_page_url = mm.fields.field_map_page_url.und[0].url;
			map_page_url = map_page_url.replace(/.*\//, '')
			map_page_title = mm.fields.field_map_page_url.und[0].title;
		}
		
		if (!map_page_url) {
			console.log('no map page url');
			//callback(new Error('map_page_url undefined '));
			return;
		}
		else {
			var dirPath = './public/map/' + map_page_url;
			console.log('\n dirPath: ' + dirPath);
			
			if (map_new) {

				console.log('map map_page_url : ' + map_page_url);
				
				if (fs.existsSync(dirPath)) {
					fs.removeSync(dirPath);
				}
				
				fs.mkdir(dirPath, function(err){
					if (err) {
						console.log('fs.mkdir err');
						//callback(err);	
						return;
					}
					else {
						console.log('new dir created');
				
						copyFromTemplates(mm, dirPath);
						//callback(null);
						return;
					}
				});				
			}
			else {
				//callback(new Error('map error undefined '));
				console.log('map error undefined');
				return;
			}			
		}
	//}
}

function forceMap() { // force will clear and rebuild
	console.log('\n deployMap :  '  );
	console.log('forceLock :  ' + forceLock );
	try {
		if (forceLock) {
			console.error('forceLock err - wait');
			return;
		}
		else {
			contentJson = '';
			
			if (fs.existsSync(mapDirPath)) {
				
				forceLock = true;
				console.log('forceLock t :  ' + forceLock );
				fs.remove(mapDirPath, function(err){
					if (err) {
						console.error('fs.remove err' + err);
						return;
					}
					else {
						forceLock = false;
						console.log('forceLock f :  ' + forceLock );
						
						deployMap(false);					
					}
				});
			
				//fs.removeSync(mapDirPath);
			}
		}
	}
	catch (e) {
		console.error('Exception in forceMap:'+e);		
	}
}

function deployMap(repeat) {
	console.log('\n deployMap :  '  );
	try {				
		
		if (!fs.existsSync(mapDirPath)) {
			fs.mkdirSync(mapDirPath);
		}		
						
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

				//var asyncTasks = [];
				
				if (JSON.stringify(newDataJson) != JSON.stringify(oldDataJson)) {
				
					console.log('newDataJson != oldDataJson');
				
					for (var i = 1; i < newDataJson.length; i++) {	
						//asyncTasks.push( createMap(newDataJson[i]) );
						createMap(newDataJson[i]);
					}
					
					contentJson = newDataJson;
				}
				else {
					console.log('no change - newDataJson == oldDataJson');
				}
								
				/*
				async.parallel(asyncTasks, function(err) {
					if (err) {
						console.error('async.parallel err :' + err );
					}
					else {
						console.log('\n\n all maps done');
						contentJson = newDataJson;
					}
				});
				*/
				
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

function is_new(m) {
	//check if is new map and/or version
	//console.log('\n is_new');
	
	var nid_new = m.nid;
	var vid_new = m.vid;
	//var maps = contentJson;
	var is_new_map = true;
	var is_new_version = true;
	var new_status = true;
	
	for (var i = 1; i < contentJson.length; i++) {
		var nid_current = contentJson[i].nid;
		var vid_current = contentJson[i].vid;
		if (nid_new == nid_current) {
			is_new_map = false;			
			if (vid_new == vid_current) {
				is_new_version = false;
				new_status = false;
			}
		}
	}
	//console.log(' new_status : ' + new_status );

	//return {'is_new_map': is_new_map, 'is_new_version': is_new_version};
	return new_status;;
}


function copyFromTemplates(m, dirPath) {
	//console.log('\n copyFromTemplates');
	var templatePath = './public/map_templates';
	fs.copy(templatePath, dirPath, function (err) {
		if (err) {
			console.error('copyFromTemplates err' + err);
		}
		else {
			//console.log('templates copied to map directory');
			writeMapOptions(m, dirPath);	
		}
	});
}

function writeMapOptions(m, dirPath) {
	//console.log('\n writeMapOptions');
	
	var filePath = dirPath + '/mapOptions.js';
	//var file = fs.createWriteStream(filePath);
	var optionData = 'var mapOptions = ' + JSON.stringify(m) + ';';
	//file.write(optionData);
	//file.end();
	
	//console.log(' filePath : ' + filePath);
	
	fs.writeFile(filePath, optionData, function(err) {
		if (err) {
			return console.error('writeMapOptions err : ' + err);
		}
		else {
			//console.log('mapOptions.js was saved');
		}
	}); 	
}

// **********************************************************
// resp

function getContentAPI(req, res) {
	res.json(contentJson);
}

function pullMap(req, res) {
	
	console.log('\n pullMap ');
	
	try {

		var forceType = req.query.force;
		//console.log('forceType : ' + forceType);		

		if (forceType == 'true') {			
			
			if (forceLock) {
				res.status(500);
				res.send({'status': 'error', 'msg': 'Pull Map Exception: Force Locked Please Wait'});
				return;
			}
			else {
				forceMap();	

				res.send({'status': 'ok', 'msg': 'Pull Map Requested with Force'});	
				return;
			}
		}
		else {
			deployMap(false);		
			res.send({'status': 'ok', 'msg': 'Pull Map Requested'});	
			return;
		}		
	}
	catch (e) {
		console.error('Exception in pullMap: ' + e);
		res.status(500);
		res.send({'status': 'error', 'msg': 'Pull Map Exception: ' + e});
	}	
}

// **********************************************************
// export

module.exports.deployMap = deployMap;
module.exports.getContentAPI = getContentAPI;
module.exports.pullMap = pullMap;
