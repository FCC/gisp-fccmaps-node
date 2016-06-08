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
var unzip = require('unzip');

var request = require('request');

var async = require('async');

//config
var config = getConfig();

var CONTENT_API = config.CONTENT_API;
var NODE_ENV = config.NODE_ENV;

var deployInterval = 300000; //microseconds
var drupalData;



var contentJson = [];
var mapDataJson;


function getConfig() {
    var configEnv = require('../config/env.json');

    var NODE_ENV = process.env.NODE_ENV || "NONE";
    var NODE_PORT = process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
    var PG_DB = configEnv[NODE_ENV].PG_DB;
    var PG_SCHEMA = configEnv[NODE_ENV].PG_SCHEMA;
    var GEO_HOST = configEnv[NODE_ENV].GEO_HOST;
    var GEO_SPACE = configEnv[NODE_ENV].GEO_SPACE;
	var CONTENT_API = configEnv[NODE_ENV].CONTENT_API;
	
    var ret = {
		"NODE_ENV": NODE_ENV,
        "NODE_PORT": NODE_PORT,
        "PG_DB": PG_DB,
        "PG_SCHEMA": PG_SCHEMA,
        "GEO_HOST": GEO_HOST,
        "GEO_SPACE": GEO_SPACE,
		"CONTENT_API": CONTENT_API
    };

    return ret;
}

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

function mapDeploy(type) {

	try {
	
		if (!fs.existsSync(mapDirPath)) {
			fs.mkdirSync(mapDirPath);
		}
		
		
		var source = 'static';
		
		if (source == 'static') {
			if (NODE_ENV == 'LOCAL') {
			var url = 'http://localhost:6479/content.json';
			}
			else {
			var url = "http://gisp-fccmaps-node-dev.us-west-2.elasticbeanstalk.com/content.json";
			}
		}
		else {
			var url = CONTENT_API;
		}
		
		console.log(url);
		
		http.get(url, function(res) {
			var data = "";
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
		
				//drupalData = JSON.parse(data);
				var mapData = data;
				mapData = mapData.replace(/\\n/g, '');
				mapData = mapData.replace(/\\r/g, '');
		
				mapDataJson = JSON.parse(mapData);

				console.log("Drupal API data received.");

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

		if (type == "repeat") {
			setTimeout(function() {
				mapDeploy("repeat");
			}, deployInterval);
			console.log((new Date()).toString() + " wait...");
		}
		else {
			console.log("one time run to pull Drupal");
		}


	}
	catch (e) {
		console.error('Exception in mapDeploy:'+e);
		if (type == "repeat") {
			console.log('resumme mapDeploy loop');
			setTimeout(function() {
				mapDeploy("repeat");
			}, deployInterval);
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

function pullDrupal(req, res) {

	try {
		console.log("Manual pull of Drupal API");
		mapDeploy("onetime");
		res.send({"status": "ok"});	
	}
	catch (e) {
		console.error('Exception in pullDrupal: ' + e);
		res.send({"status": "error", "msg": "Exception in pullDrupal: " + e});
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

module.exports.mapDeploy = mapDeploy;
module.exports.getContentAPI = getContentAPI;
module.exports.pullDrupal = pullDrupal;
