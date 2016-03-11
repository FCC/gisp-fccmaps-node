

var config = getConfig();
var geo_host = config.GEO_HOST;
var geo_space = config.GEO_SPACE;
var PG_DB = config.PG_DB;
var pg_schema = config.PG_SCHEMA;
var drupal_api = config.DRUPAL_API;

var deployInterval = 60000; //microseconds
var drupalData;

//db
var pg_query = require('pg-query');
pg_query.connectionParameters = PG_DB;

var http = require("http");
var https = require("https");
var fs = require('fs-extra');
var unzip = require('unzip');
var github = require('github');
var request = require('request');


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
        "NODE_PORT": NODE_PORT,
        "PG_DB": PG_DB,
        "PG_SCHEMA": PG_SCHEMA,
        "GEO_HOST": GEO_HOST,
        "GEO_SPACE": GEO_SPACE,
		"DRUPAL_API": DRUPAL_API
    };

    return ret;
}

function mapDeploy() {

	try {
	
	var url = DRUPAL_API;

	http.get(url, function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
	
		drupalData = JSON.parse(data);
		mapData = data;
		mapData = mapData.replace(/\\n/g, '');
		mapData = mapData.replace(/\\r/g, '');
		//mapData = mapData.replace(/"\{/g, '{');
		//mapData = mapData.replace(/"\}"/g, '}');
		//mapData = mapData.replace(/\\"/g, '"');
		

		console.log("Drupal API data received.");
		console.log(mapData);
		
		//get repo zip file
		var url_repo = "https://codeload.github.com/FCC/gisp-map-demo/zip/gh-pages";
		var repoName = "gisp-map-demo";
		var dirPath = "./public/maps/" + repoName;
		var zipName = repoName + ".zip";
		var filePath = dirPath + "/" + zipName;
		if (fs.existsSync(dirPath)) {
			fs.removeSync(dirPath);
		}
		fs.mkdirSync(dirPath);

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
		
			console.log("unzip closed");
			var files = fs.readdirSync(dirPath);
		console.log(files);
		
		for (var i = 0; i < files.length; i++) {
			console.log(files[i]);
			if (files[i] != zipName) {
			console.log('copying...');
			var zipPath = dirPath + '/' + files[i];
			fs.copy(zipPath, dirPath, function (err) {
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

					//write mapOptions.json
					var repoName = "gisp-map-demo";
					var dirPath = "./public/maps/" + repoName;
					var filePath = dirPath + "/mapOptions.js";
					var file = fs.createWriteStream(filePath);
					mapData = "var mapOptions = " + mapData + ";";
					file.write(mapData);
					file.end();
					
					//make full screen page
					var repoName = "gisp-map-demo";
					var data0 = getDrupalData(repoName);
					
					console.log("data =");
					console.log(data0);
					console.log("mapOptions");
					var mapOptions = data0.fields.field_description.und[0].value;
					console.log(mapOptions);
					mapOptions = mapOptions.replace(/\r/g,'');
					mapOptions = mapOptions.replace(/\n/g,'');
					console.log(mapOptions);

					mapOptions = JSON.parse(mapOptions);
					console.log(mapOptions);
					console.log("layers")
					console.log(mapOptions.layers[0]);
					
					
					
					var pageText = "<!DOCTYPE html><html><head><title>" + data0.title + "</title>" +
						"</head><body><center><h3>" + data0.title + "</h3><h4>" + data0.fields.field_subtitle.und[0].value + "</h4>" +
						"<iframe width=\"100%\" height=\"700\" src=\"iframe.html\"></iframe><p>" +
						data0.fields.field_description.und[0].value +
						"<p>" + "Created: " + data0.created +
						"<p>" + "Changed: " + data0.changed + 
						"<p>" + "Updated/Reviewd: " + data0.fields.field_date_updated_reviewed.und[0].value +
						"<p>" + "Map display date: " + data0.fields.field_map_display_date.und[0].value;
						
					pageText += "</center></body></html>";
					
					var templateFile = "fullscreen_template.html";
					var templatePath = dirPath + "/" + templateFile;
	                fs.readFile(templatePath, 'utf8', function(err, data) {
	                    if (err) {
	                        return console.log(err);
	                    }
						
						data = data.replace(/##field_title##/, data0.title);
						data = data.replace(/##field_description##/, data0.fields.field_description.und[0].value);
						data = data.replace(/##field_date_updated_reviewed##/, data0.fields.field_date_updated_reviewed.und[0].value);
						
						var outFileName = "fullscreen.html";
						var outFilePath = dirPath + "/" + outFileName;
						
						console.log(outFilePath);
						fs.writeFile(outFilePath, data, function (err) {
							if (err) { 
								return console.log(err);
							}
							console.log('write fullscreen.html');
						});
						
					});

					
					setTimeout(function() {
						mapDeploy();
						}, deployInterval);
		
						console.log((new Date()).toString() + " wait...");
					}
			});
			
			}
		}
		

		})
		);
		
		});
		
		});
		
		
		});
	}).on("error", function() {
		console.log('error accessing ' + url);
		
		setTimeout(function() {
			mapDeploy();
		}, deployInterval);
		

	});
	}
	
	catch (e) {
		console.error('Exception in mapDeploy:'+e);
		console.log('resumme mapDeploy loop');
		setTimeout(function() {
			mapDeploy();
		}, deployInterval);
		
	}


}

function getDrupalData(repoName) {
	for (var i = 1; i < drupalData.length; i++) {
		if (drupalData[i].fields.field_map_repository.und && drupalData[i].fields.field_map_repository.und[0].title == repoName) {
			return drupalData[i];
		}
	
	}
	
	return null;


}



function mapDeploy2(type) {

	try {
	
		var url = drupal_api;

		http.get(url, function(res) {
			var data = "";
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
		
			drupalData = JSON.parse(data);
			mapData = data;
			mapData = mapData.replace(/\\n/g, '');
			mapData = mapData.replace(/\\r/g, '');
			//mapData = mapData.replace(/"\{/g, '{');
			//mapData = mapData.replace(/"\}"/g, '}');
			//mapData = mapData.replace(/\\"/g, '"');
			
			mapDataJson = JSON.parse(mapData);

			console.log("Drupal API data received.");
			m = mapDataJson;
			
			for (var i = 1; i < m.length; i++) {
				var nid = m[i].nid;
				var vid = m[i].vid;
				var map_repository = "";
				
				if (m[i].fields.field_map_repository.und) {
					map_repository = m[i].fields.field_map_repository.und[0].title;
				}
			
				processMap(m[i]);
				
			}
			
			});
		});
		
		if (type == "repeat") {
			setTimeout(function() {
				mapDeploy2("repeat");
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
				mapDeploy2("repeat");
			}, deployInterval);
		}
	}
}


function processMap(m) {
	var nid = m.nid;
	var vid = m.vid;
	var title = m.title;
	var subtitle = m.fields.field_subtitle.und[0].value;
	var description = "This is description";
	var map_repository_title = "";
	var map_repository_url = "";
	var map_page_url = "";
	var map_page_title = "";
	
	if (m.fields.field_map_page_url.und) {
		map_page_url = m.fields.field_map_page_url.und[0].url;
		map_page_title = m.fields.field_map_page_url.und[0].title;
	}
	
	if (m.fields.field_map_repository.und) {
		map_repository_title = m.fields.field_map_repository.und[0].title;
		map_repository_url = m.fields.field_map_repository.und[0].url;
	}
	
	//console.log("nid=" + nid + " vid=" + vid + " map_repository_title=" + map_repository_title + " map_repository_url=" + map_repository_url + " map_page_url=" + map_page_url + " map_page_title=" + map_page_title);
	if (map_page_url == "") {
		//console.log("no map page url");
		return;
	}
	else {
		//check if is new map/version
		var dirPath = "./public/" + map_page_url;
		var q = "SELECT nid, vid FROM fcc.gisp_map_list WHERE nid = $1 ORDER BY create_ts DESC";
		var vals = [nid];
		pg_query(q, vals, function(pg_err, pg_rows, pg_res){
		if (pg_err){
			console.error('error running pg_query', pg_err);
		}
		else {
			if (pg_rows.length == 0) {
				//new map - create directory and write files
				console.log("new map: " + map_page_url);
				if (fs.existsSync(dirPath)) {
					fs.removeSync(dirPath);
				}
				fs.mkdirSync(dirPath);
				console.log("new dir created");
				copyFromTemplates(m, dirPath);
				writeMapOptions(m, dirPath);
				//writeToTable(nid, vid, title, subtitle, description, map_page_url, map_page_title, map_repository_url, map_repository_title);
				checkGithubRepo(m);
				
			}
			else {
				if (pg_rows[0].vid == vid) {
					//no update - do nothing
				}
				else {
					//new version - write new json file to directory
					console.log("new version")
					writeMapOptions(m, dirPath);
					//writeToTable(nid, vid, title, subtitle, description, map_page_url, map_page_title, map_repository_url, map_repository_title);
				}
				
				checkGithubRepo(m);
			}
		}

		});
	
	
	}
}


function checkGithubRepo(m) {
	var map_repository = "";
	
	if (m.fields.field_map_repository.und) {
		map_repository = m.fields.field_map_repository.und[0].title;
	}
	
	//map_repository = "gisp-map-demo";
	console.log('repo= ' + map_repository)
	url = "https://github.com/FCC/" + map_repository + "/tree/gh-pages";
	console.log('url=' + url);

	request(url, {method: 'GET'}, function (err, res, body){
		
		if (res.headers.status == '404 Not Found') {
		console.log(res.headers.status + ' ' + url);
		return;
		}
		var lines = body.split('\n');
		var latestModified = "";
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].match(/itemprop="dateModified"/)) {
				latestModified = lines[i].replace(/^.*datetime="/, '').replace(/".*$/, '');
			}
		}
		
		console.log('latestModified=' + latestModified);
		
		if (latestModified == "") {
		
			return;
		}
		else {
			var d = new Date(latestModified);
			console.log(latestModified);
			var ts_repo = d.getTime();
			var ts_now = (new Date()).getTime();
			console.log(ts_repo + ' ' + ts_now);
			console.log("download zip repo file...");
		
		}
	
  
  
  
	});
	


}


function copyFromTemplates(m, dirPath) {
	console.log(m)
	console.log(dirPath);
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

function writeToTable(nid, vid, title, subtitle, description, map_page_url, map_page_title, map_repository_url, map_repository_title) {
	var q = "INSERT INTO fcc.gisp_map_list (nid, vid, title, subtitle, description, map_page_url, map_page_title, map_repository_url, map_repository_title, create_ts) \
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())";
	var vals = [nid, vid, title, subtitle, description, map_page_url, map_page_title, map_repository_url, map_repository_title];
	pg_query(q, vals, function(pg_err, pg_rows, pg_res){
		if (pg_err){
			console.error('error running pg_query', pg_err);
		}
		else {
			console.log('success wrting to table');
		}
	});

}


function getExistingMaps(req, res) {
	q = "SELECT nid, vid, title, subtitle, description, map_page_url, create_ts FROM fcc.gisp_map_list ORDER BY create_ts desc, nid, vid";
	vals = [];
	pg_query(q, vals, function(pg_err, pg_rows, pg_res){
		if (pg_err){
			console.error('error running pg_query', pg_err);
		}
		else {
			var urls = [];
			var titles = [];
			var subtitles = [];
			var descriptions = [];
			var vids = [];
			var create_tss = [];
			console.log('rows=')
			console.log(pg_rows)
			for (var i = 0; i < pg_rows.length; i++) {
				var url = pg_rows[i].map_page_url;
				var title = pg_rows[i].title;
				var subtitle = pg_rows[i].subtitle;
				var description = pg_rows[i].description;
				var vid = pg_rows[i].vid;
				var create_ts = pg_rows[i].create_ts;
				if (url != "" && urls.indexOf(url)== -1) {
					urls.push(url);
					titles.push(title);
					subtitles.push(subtitle);
					descriptions.push(description);
					vids.push(vid);
					create_tss.push(create_ts);
				}
			}
			
			console.log(urls)
			res.send({"urls": urls, "titles": titles, "subtitles": subtitles, "descriptions": description, "vids": vids, "create_tss": create_tss});
		}
	});
	

}

function pullDrupal(req, res) {

	try {
	
		console.log("Manual pull of Drupal API");
		mapDeploy2("onetime");
		res.send({"status": "ok"});
		
	}
	catch (e) {
		console.error('Exception in pullDrupal: ' + e);
		res.send({"status": "error"});
	}	
}





module.exports.mapDeploy = mapDeploy;
module.exports.mapDeploy2 = mapDeploy2;
module.exports.getExistingMaps = getExistingMaps;
module.exports.pullDrupal = pullDrupal;
