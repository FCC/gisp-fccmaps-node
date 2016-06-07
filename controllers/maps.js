
var config = getConfig();
var geo_host = config.GEO_HOST;
var geo_space = config.GEO_SPACE;
var PG_DB = config.PG_DB;
var pg_schema = config.PG_SCHEMA;
var drupal_api = config.DRUPAL_API;
var NODE_ENV = config.NODE_ENV;

var deployInterval = 300000; //microseconds
var drupalData;

//db
var pg_query = require('pg-query');
//pg_query.connectionParameters = PG_DB;

var http = require("http");
var https = require("https");
var fs = require('fs-extra');
var unzip = require('unzip');
//var github = require('github');
var request = require('request');
var cache = require('memory-cache');
var async = require('async');

cache.put('drupal_current', []);

var mapDataJson;


function getConfig() {
    var configEnv = require('../config/env.json');

    var NODE_ENV = process.env.NODE_ENV || "NONE";
    var NODE_PORT = process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
    var PG_DB = configEnv[NODE_ENV].PG_DB;
    var PG_SCHEMA = configEnv[NODE_ENV].PG_SCHEMA;
    var GEO_HOST = configEnv[NODE_ENV].GEO_HOST;
    var GEO_SPACE = configEnv[NODE_ENV].GEO_SPACE;
	var DRUPAL_API = configEnv[NODE_ENV].DRUPAL_API;
	
    var ret = {
		"NODE_ENV": NODE_ENV,
        "NODE_PORT": NODE_PORT,
        "PG_DB": PG_DB,
        "PG_SCHEMA": PG_SCHEMA,
        "GEO_HOST": GEO_HOST,
        "GEO_SPACE": GEO_SPACE,
		"DRUPAL_API": DRUPAL_API
    };

    return ret;
}


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
	
	//compare with drupal_current to see if they are different

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
		var dirPath = "./public/" + map_page_url;
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
			var url = drupal_api;
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
					cache.put('drupal_current', mapDataJson);
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
	var maps = cache.get('drupal_current');
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
			//get repo if exists
			var repo = "";
			if (m.fields.field_map_repository.und) {
				repo = m.fields.field_map_repository.und[0].url;
				repo = repo.replace(/.*\//, '')
			}
			var nid = m.nid;
			if (repo != "") {
				pullRepo1(nid);
			}
			
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


function getExistingMaps(req, res) {
	var drupal = cache.get('drupal_current');
	res.send(drupal);
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

function pullRepo(req, res) {

	try {
	
		console.log("Manual pull of repo");
		var nid = req.params.nid;
		var repoName = getRepoName(nid);
		var mapUrl = getMapUrl(nid);
		
		console.log('nid=', nid, 'repo=', repoName, 'url=', mapUrl);
		
		if (repoName != "" && mapUrl != "") {
			//get repo zip file
			var url_repo = "https://codeload.github.com/FCC/" +repoName + "/zip/gh-pages";
			var dirPath = "./public/" + mapUrl;
			var zipName = repoName + ".zip";
			var filePath = dirPath + "/" + zipName;

			var file = fs.createWriteStream(filePath);
			
			https.get(url_repo, function(res1) {
				var data = "";
				
				res1.on('data', function(chunk) {
					data += chunk;
					file.write(chunk);
				});
				
				res1.on("end", function() {
				
					file.end();
				
					console.log("repo downloaded");

					//unzip
					fs.createReadStream(filePath).pipe(unzip.Extract({ path: dirPath }).on("close", function() {
					
						console.log("unzip");
						console.log('copying...');
						var unzipped_dir = repoName + "-gh-pages";
						var zipPath = dirPath + '/' + unzipped_dir;
						fs.copy(zipPath, dirPath, true, function (err) {
							if (err) {
								console.error(err);
								}
							else {
								console.log("zip dir copied");
								try {
									fs.removeSync(zipPath);
									console.log("zip directory deleted");
								}
								catch (e) {
									console.log(e);
								}
								try {
									fs.removeSync(filePath);
									console.log("zip file deleted");
								}
								catch (e) {
									console.log(e);
								}
								
							}
						});
				
					}));
				
				});
				
			});
		
		
		}
		
		res.send({"status": "ok"});
		
	}
	catch (e) {
		console.error('Exception in pullRepo: ' + e);
		res.send({"status": "error"});
	}	
}


function pullRepo1(nid) {
	try {
		var repoName = getRepoName(nid);
		var mapUrl = getMapUrl(nid);
		
		console.log('nid=', nid, 'repo=', repoName, 'url=', mapUrl);
		
		if (repoName != "" && mapUrl != "") {
			//get repo zip file
			var url_repo = "https://codeload.github.com/FCC/" +repoName + "/zip/gh-pages";
			var dirPath = "./public/" + mapUrl;
			var zipName = repoName + ".zip";
			var filePath = dirPath + "/" + zipName;

			var file = fs.createWriteStream(filePath);
			
			https.get(url_repo, function(res1) {
				var data = "";
				
				res1.on('data', function(chunk) {
					data += chunk;
					file.write(chunk);
				});
				
				res1.on("end", function() {
				
					file.end();
				
					console.log("repo downloaded");

					//unzip
					fs.createReadStream(filePath).pipe(unzip.Extract({ path: dirPath }).on("close", function() {
					
						console.log("unzip");
						console.log('copying...');
						var unzipped_dir = repoName + "-gh-pages";
						var zipPath = dirPath + '/' + unzipped_dir;
						fs.copy(zipPath, dirPath, true, function (err) {
							if (err) {
								console.error(err);
								}
							else {
								console.log("zip dir copied");
								try {
									fs.removeSync(zipPath);
									console.log("zip directory deleted");
								}
								catch (e) {
									console.log(e);
								}
								try {
									fs.removeSync(filePath);
									console.log("zip file deleted");
								}
								catch (e) {
									console.log(e);
								}
								
							}
						});
				
					}));
				
				});
				
			});
		
		}
	}
	catch (e) {
	console.error('Exception in pullRepo1: ' + e);
	}
	
}



function getRepoName(nid) {
	var repoName = "";
	var map_info = cache.get('drupal_current');
	for (var i = 1; i < map_info.length; i++) {
		if (map_info[i].nid == nid) {
			if (map_info[i].fields.field_map_repository.und) {
				repoName = map_info[i].fields.field_map_repository.und[0].url;
			}
		}
	}
	
	return repoName;
}

function getMapUrl(nid) {
	var url = "";
	var map_info = cache.get('drupal_current');
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
module.exports.getExistingMaps = getExistingMaps;
module.exports.pullDrupal = pullDrupal;
module.exports.pullRepo = pullRepo;