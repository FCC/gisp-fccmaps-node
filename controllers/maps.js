

var config = getConfig();
var geo_host = config.GEO_HOST;
var geo_space = config.GEO_SPACE;
var PG_DB = config.PG_DB;
var pg_schema = config.PG_SCHEMA;

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

function getConfig() {
    var configEnv = require('../config/env.json');

    var NODE_ENV = process.env.NODE_ENV || "NONE";
    var NODE_PORT = process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
    var PG_DB = configEnv[NODE_ENV].PG_DB;
    var PG_SCHEMA = configEnv[NODE_ENV].PG_SCHEMA;
    var GEO_HOST = configEnv[NODE_ENV].GEO_HOST;
    var GEO_SPACE = configEnv[NODE_ENV].GEO_SPACE;

    var ret = {
        "NODE_PORT": NODE_PORT,
        "PG_DB": PG_DB,
        "PG_SCHEMA": PG_SCHEMA,
        "GEO_HOST": GEO_HOST,
        "GEO_SPACE": GEO_SPACE
    };

    return ret;
}

function mapDeploy() {

	try {
	
	var url = "http://10.154.68.187/api/content.json?type=map&limit=10000&fields=all";

	http.get(url, function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
		
		drupalData = JSON.parse(data);

		console.log("Drupal API data received.");
		
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
					
					//make full screen page
					var repoName = "gisp-map-demo";
					var data0 = getDrupalData(repoName);
					
					console.log("data =");
					console.log(data0);
					
					
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


module.exports.mapDeploy = mapDeploy;

