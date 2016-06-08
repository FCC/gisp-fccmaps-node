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
//require
var http = require("http");
var https = require("https");
var fs = require('fs-extra');

var request = require('request');

var async = require('async');

// **********************************************************
//config

var configEnv = require('../config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds

// **********************************************************

var contentJson = [];
var mapDataJson;

var mapDirPath = './public/map';

var task = function(mm) { return function(callback) {

	var nid = mm.nid;
	var vid = mm.vid;
	var map_repository_title = "";
	var map_repository_url = "";
	var map_page_url = "";
	var map_page_title = "";
	
	//see if there is map_page_url
	if ( !(mm.fields.field_map_page_url.und && mm.fields.field_map_page_url.und[0].url)) {
		callback();
		return;
	}
	
	//see if map type is int_layers
	var map_type = '';
	if (mm.fields.field_map_type && mm.fields.field_map_type.und) {
		map_type = mm.fields.field_map_type.und[0].value;
	}
	if (map_type != 'int_layers') {
		callback();
		return;
	}
	
	//compare with contentJson to see if they are different
	var map_status = is_new(mm);
	
	if (!map_status.is_new_map && !map_status.is_new_version) {
		callback();
		return;
	}
	
	if (mm.fields.field_map_page_url.und) {
	
		console.log(mm.fields.field_map_page_url.und);
	
		map_page_url = mm.fields.field_map_page_url.und[0].url;
		map_page_url = map_page_url.replace(/.*\//, '')
		map_page_title = mm.fields.field_map_page_url.und[0].title;
	}
	
	if (mm.fields.field_map_repository.und) {
		map_repository_title = mm.fields.field_map_repository.und[0].title;
		map_repository_url = mm.fields.field_map_repository.und[0].url;
		map_repository_url = map_repository_url.replace(/.*\//, '')
	}
	
	if (map_page_url == "") {
		console.log("no map page url");
		callback();
		return;
	}
	else {
		var dirPath = "./public/map/" + map_page_url;
		//new map - create directory and write files
		if (map_status.is_new_map) {
			console.log("new Map");
			console.log("new map: " + map_page_url);
			if (fs.existsSync(dirPath)) {
				fs.removeSync(dirPath);
			}
			fs.mkdirSync(dirPath);
			console.log("new dir created");
			copyFromTemplates(mm, dirPath);
			callback();
		}
		else if (map_status.is_new_version) {
			//new version - write new json file to directory
			console.log("new version")
			writeMapOptions(mm, dirPath);
			callback();
		}
		
	}
}
}

function deployMap(repeat) {

	try {
	
		if (!fs.existsSync(mapDirPath)) {
			fs.mkdirSync(mapDirPath);
		}
						
		var contentProtocol = https;
		if (CONTENT_API.indexOf('http://') == 0) {
			contentProtocol = http;
			console.log('contentProtocol : http ' );
		}		
		console.log('CONTENT_API : ' + CONTENT_API);
		
		contentProtocol.get(CONTENT_API, function(res) {
			var data = "";
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
		
				var mapData = data;
				mapData = mapData.replace(/\\n/g, '');
				mapData = mapData.replace(/\\r/g, '');
		
				mapDataJson = JSON.parse(mapData);

				console.log("CONTENT_API data received.");

				var asyncTasks = [];
				
				for (var i = 1; i < mapDataJson.length; i++) {	
					asyncTasks.push(task(mapDataJson[i]));
				}
				
				async.parallel(asyncTasks, function() {
					console.log("all maps done");
					contentJson = mapDataJson;
				});
				
			});
			
		});

		if (repeat) {
			setTimeout(function() {
				deployMap(true);
			}, DEPLOY_INTERVAL);
			console.log((new Date()).toString() + " wait...");
		}
		else {
			console.log("one time run to pull");
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
	var nid_new = m.nid;
	var vid_new = m.vid;
	var maps = contentJson;
	var is_new_map = true;
	var is_new_version = true;
	for (var i = 1; i < maps.length; i++) {
		var nid_current = maps[i].nid;
		var vid_current = maps[i].vid;
		if (nid_new == nid_current) {
			is_new_map = false;
			if (vid_new == vid_current) {
				is_new_version = false;
			}
		}
	}

	return {"is_new_map": is_new_map, "is_new_version": is_new_version}
}


function copyFromTemplates(m, dirPath) {
	var templatePath = "./public/map_templates";
	fs.copy(templatePath, dirPath, function (err) {
		if (err) {
			console.error(err);
		}
		else {
			console.log("templates copied to map directory");
			writeMapOptions(m, dirPath);	
		}
	});
}


function writeMapOptions(m, dirPath) {
	var filePath = dirPath + "/mapOptions.js";
	var file = fs.createWriteStream(filePath);
	var optionData = "var mapOptions = " + JSON.stringify(m) + ";";
	file.write(optionData);
	file.end();
	console.log("updating mapOptions");
}


function getContentAPI(req, res) {
	res.json(contentJson);
}

function pullMap(req, res) {

	try {
		console.log("Manual pull of content API");
		deployMap(false);
		res.send({"status": "ok"});	
	}
	catch (e) {
		console.error('Exception in pullMap: ' + e);
		res.send({"status": "error", "msg": "Exception in pullMap: " + e});
	}	
}

function getMapUrl(nid) {
	var url = "";
	var map_info = contentJson;
	for (var i = 1; i < map_info.length; i++) {
		if (map_info[i].nid == nid) {
			if (map_info[i].fields.field_map_page_url.und) {
				url = map_info[i].fields.field_map_page_url.und[0].url;
			}
		}
	}
	
	return url;
}

module.exports.deployMap = deployMap;
module.exports.getContentAPI = getContentAPI;
module.exports.pullMap = pullMap;
