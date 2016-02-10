

var config = getConfig();
var geo_host = config.GEO_HOST;
var geo_space = config.GEO_SPACE;
var PG_DB = config.PG_DB;
var pg_schema = config.PG_SCHEMA;


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


	var url = "https://www.fcc.gov/api/content.json?type=map&limit=10000&fields=all";

	https.get(url, function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
		
		data_json = JSON.parse(data);
		var data1 = data_json[1];
		var title = data1.title;
		var field_description = data1.fields.field_description.und[0].value;
		
		console.log(data1.fields);
		
		console.log(title + '\n' + field_description);
		
		
var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0"
    // optional
    //debug: true,
    //protocol: "https",
    //host: "github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
    //pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    //timeout: 5000,
    //headers: {
      //  "user-agent": "My-Cool-GitHub-App" // GitHub is happy with a unique user agent
    //}
});

//console.log(github);

		
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
		
		console.log("repo got");

		//fs.writeFile(filePath, data, 'binary', function(err) {
		//	if(err) {
		//		return console.log(err);
		//	}
		//	console.log("write zip file " + filePath);
		//});
		
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
					fs.removeSync(zipPath);
					console.log("zip directory deleted");
					fs.removeSync(filePath);
					console.log("zip file deleted");
					setTimeout(function() {
						mapDeploy();
						}, 60000);
		
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
		}, 6000);
		

	});
	



}


function amrProcess(req, res) {

	try {
	
	    var lat = req.params.lat;
	    var lon = req.params.lon;

	    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
	        console.log('error: invalid lat/lon');
	        res.send({
	            'status': 'error',
				'msg': 'invalid lat/lon'
	        });
	        return;
	    }

	    var q = "SELECT ST_Intersects(geom, ST_Setsrid(ST_Makepoint(" +
				"$2" + "," + "$1" + "), 4326)) FROM " + pg_schema + ".amr_country_border WHERE iso = 'USA'";
		var vals = [lat, lon];
		
		pg_query(q, vals, function(pg_err, pg_rows, pg_res){
			if (pg_err){
			console.error('error running pg_query', pg_err);
			res.send({
				'status': 'error',
				'msg': 'error running pg_query US intersection'
			});
			}
			else {
				var insideUs = pg_rows[0].st_intersects;
				
	        if (insideUs) {

	            var url = "http://ned.usgs.gov/epqs/pqs.php?x=" + lon + "&y=" + lat + "&units=Meters&output=json";

	            http.get(url, function(res1) {
	                var data = "";
	                res1.on('data', function(chunk) {
	                    data += chunk;
	                });
	                res1.on("end", function() {
	                    processElevation(data);
	                });
	            }).on("error", function() {
	                console.log('error accessing ' + url);
	                res.send({
	                    'status': 'error',
						'msg': 'error accessing usgs site'
	                });
	            });

	            function processElevation(data) {
	                var data = JSON.parse(data);
	                var Elevation_Query = data.USGS_Elevation_Point_Query_Service;
	                var elevation = Elevation_Query.Elevation_Query.Elevation;
	                var rcamsl = elevation + 10; //antenna height
	                rcamsl = Math.round(rcamsl * 10) / 10;

	                var lat1 = Math.abs(lat)
	                var dlat = Math.floor(lat1)
	                var mlat = Math.floor((lat1 - dlat) * 60);
	                var slat = Math.floor(Math.round((lat1 - (dlat + mlat / 60.0)) * 3600))
	                ns = 1
	                if (lat < 0) {
	                    ns = -1
	                }
	                var lon1 = Math.abs(lon)
	                var dlon = Math.floor(lon1)
	                var mlon = Math.floor((lon1 - dlon) * 60);
	                var slon = Math.floor(Math.round((lon1 - (dlon + mlon / 60.0)) * 3600))
	                ew = 1
	                if (lon < 0) {
	                    ew = -1
	                }

	                var url = "http://transition.fcc.gov/fcc-bin/haat_calculator?dlat=" + 
							dlat + "&mlat=" + mlat + "&slat=" + slat + "&ns=" + ns + "&dlon=" + 
							dlon + "&mlon=" + mlon + "&slon=" + slon + "&ew=" + ew + "&nad=83&rcamsl=" + 
							rcamsl + "&nradials=360&terdb=0&text=1";

	                http.get(url, function(res1) {
	                    var data = "";
	                    res1.on('data', function(chunk) {
	                        data += chunk;
	                    });
	                    res1.on("end", function() {
	                        processHaat(data);
	                    });
	                }).on("error", function() {
	                    console.log('error accessing ' + url);
	                    res.send({
	                        'status': 'error',
							'msg': 'error accessing transition site'
	                    });
	                });
	            }

	            function processHaat(data) {
	                var haatData = data;
	                //read haat-dist look up table
	                var fs = require('fs');
	                var file = "data/ht.json";
	                fs.readFile(file, 'utf8', function(err, data) {
	                    if (err) {
	                        return console.log(err);
	                    }
	                    processHaat2(haatData, data);
	                });
	            }

				
	            function processHaat2(haatData, ht_str) {
	                var ht_json = JSON.parse(ht_str);

	                var data_arr = haatData.split("\n");
	                var i, j, az, dum, dum1, key0, dist, latlon, lat0, lon0;
	                var haat = [];
	                for (i = 0; i < data_arr.length; i++) {
	                    dum = data_arr[i].split("|");
	                    if (dum.length == 4) {
	                        dum1 = Math.round(parseFloat(dum[2].replace(/ +/g, "")));
	                        if (dum1 < 30) {
	                            dum1 = 30;
	                        }
	                        if (dum1 > 1500) {
	                            dum1 = 1500;
	                        }
	                        haat.push(dum1);
	                    }
	                }

	                var uuid = require('uuid');
	                var uuid0 = uuid.v4();
	                var dbus = [34, 37, 40, 48, 51, 54, 94, 97, 100]
	                var row_str = "";
	                for (i = 0; i < 9; i++) {
	                    if (dbus[i] <= 54) {
	                        var point_str = "";
	                        var polygon_str = "";
	                        for (az = 0; az < haat.length; az++) {
	                            key0 = dbus[i] + ":" + haat[az];
	                            dist = ht_json[key0];
	                            latlon = getLatLonPoint(lat, lon, az, dist);
	                            var lat0 = Math.round(latlon[0] * 1000000) / 1000000;
	                            var lon0 = Math.round(latlon[1] * 1000000) / 1000000;
	                            point_str = lon0 + " " + lat0;
	                            if (az == 0) {
	                                point_str_first = point_str;
	                            }
	                            polygon_str += point_str + ",";
	                        }
	                        polygon_str += point_str_first
	                        multipolygon_str = "MULTIPOLYGON(((" + polygon_str + ")))";

							row_str += "('" + uuid0 + "'," + "$1" + "," + "$2" + "," + dbus[i] + "," + 
										"ST_GeomFromText('" + multipolygon_str + "', 4326), now())" + ", ";
													
	                    } else {
	                        if (dbus[i] == 94) {
	                            var radius = 440;
	                        } else if (dbus[i] == 97) {
	                            var radius = 310;
	                        } else if (dbus[i] == 100) {
	                            var radius = 220;
	                        }

	                        row_str += "('" + uuid0 + "'," + lat + "," + lon + "," + dbus[i] + "," + 
							"ST_Buffer(ST_MakePoint(" + "$2" + "," + "$1" + ")::geography, " + radius + ")::geometry, now()), ";

	                    }
	                }

	                row_str = row_str.replace(/, +$/, "");

	                //insert_rows
	                var q = "INSERT INTO " + pg_schema + ".amr_interfering_contours (uuid, lat, lon ,dbu, geom, create_ts) VALUES " + row_str;
					var vals = [lat, lon];

					pg_query(q, vals, function(pg_err, pg_rows, pg_res){
						if (pg_err){
						console.error('error running pg_query', pg_err);
						return res.send({
	                        'status': 'error',
							'msg': 'error inserting contours'
	                    });
						}
						else {
							var async = require('async');
							var asyncTasks = [];
							var data_co_usa = [];
							var data_1_usa = [];
							var data_23_usa = [];
							var intersectsCanada = false;
							var intersectsMexico = false;
							var intersectsCaribbean = false;
							var data_co_mex = [];
							var data_1_mex = [];
							var data_23_mex = [];

							//co-channel usa
							asyncTasks.push(function(callback) {
								var q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 220 and a.service in ('FM', 'FL', 'FX') and a.class in ('A', 'C', 'C0', 'C1', 'C2', 'C3', 'D', 'L1') and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 40 and ST_Intersects(a.geom, b.geom) \
							union \
							SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 220 and a.service in ('FM', 'FL', 'FX') and a.class = 'B1' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 37 and ST_Intersects(a.geom, b.geom) \
							union \
							SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 220 and a.service in ('FM', 'FL', 'FX') and a.class = 'B' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 34 and ST_Intersects(a.geom, b.geom)";

							var vals = [];

							pg_query(q, vals, function(pg_err, pg_rows, pg_res){
								if (pg_err){
								console.error('error running pg_query', pg_err);
								callback();
								}
								else {
								data_co_usa = pg_rows;
								callback();
								}
							
							});
								
							});

							//first-adjacent usa
							asyncTasks.push(function(callback) {
								q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 219 and a.service in ('FM', 'FL', 'FX') and a.class in ('A', 'C', 'C0', 'C1', 'C2', 'C3', 'D', 'L1') and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 54 and ST_Intersects(a.geom, b.geom) \
							union \
							SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 219 and a.service in ('FM', 'FL', 'FX') and a.class = 'B1' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 51 and ST_Intersects(a.geom, b.geom) \
							union \
							SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
							FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
							WHERE a.channel > 219 and a.service in ('FM', 'FL', 'FX') and a.class = 'B' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 48 and ST_Intersects(a.geom, b.geom)";
							var vals = [];

							pg_query(q, vals, function(pg_err, pg_rows, pg_res){
								if (pg_err){
								console.error('error running pg_query', pg_err);
								callback();
								}
								else {
								data_1_usa = pg_rows;
								callback();
								}
							
							});
							
							});

							//2nd/3rd-adjacent usa
							asyncTasks.push(function(callback) {
								q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FL', 'FX') and a.class in ('A', 'C', 'C0', 'C1', 'C2', 'C3', 'D', 'L1') and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 100 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FL', 'FX') and a.class = 'B1' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 97 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FL', 'FX') and a.class = 'B' and a.country = 'US' and b.uuid = '" + uuid0 + "' and b.dbu = 94 and ST_Intersects(a.geom, b.geom)";
							var vals = [];

							pg_query(q, vals, function(pg_err, pg_rows, pg_res){
								if (pg_err){
								console.error('error running pg_query', pg_err);
								callback();
								}
								else {
								data_23_usa = pg_rows;
								callback();
								}
							});
							
							});

							//34dBu intersects with Canada?
							asyncTasks.push(function(callback) {
								q = "SELECT true as intersects FROM " + pg_schema + ".amr_canada_border a, " + pg_schema + ".amr_interfering_contours b \
							WHERE b.uuid = '" + uuid0 + "' and b.dbu = 34 and ST_Intersects(a.geom, b.geom) is true"
							var vals = [];

							pg_query(q, vals, function(pg_err, pg_rows, pg_res){
								if (pg_err){
								console.error('error running pg_query', pg_err);
								callback();
								}
								else {
									if (pg_rows.length > 0) {
										intersectsCanada = true;
									}
								callback();
								}
							});
								
							});

							//130km from MEX
							asyncTasks.push(function(callback) {
								var q = "WITH tmp_table as \
									(SELECT ST_Buffer(st_makepoint(" + "$2" + "," + "$1" + ")::geography, 130000)::geometry as geom1) \
									SELECT true as intersects FROM " + pg_schema + ".amr_mexico_border a, tmp_table b where st_intersects(a.geom, b.geom1) is True"
								var vals = [lat, lon];

								pg_query(q, vals, function(pg_err, pg_rows, pg_res){
									if (pg_err){
									console.error('error running pg_query', pg_err);
									callback();
									}
									else {
										if (pg_rows.length > 0) {
											intersectsMexico = true;
										}
									callback();
									}
								});
							
							});


							//is caribbean
							asyncTasks.push(function(callback) {
								var q = "SELECT true as intersects FROM " + pg_schema + 
										".amr_state_2010 WHERE id in ('PR', 'VI') and ST_Intersects(geom, ST_Setsrid(ST_Makepoint(" +
										"$2" + "," + "$1" + "), 4326))"
								var vals = [lat, lon];

								pg_query(q, vals, function(pg_err, pg_rows, pg_res){
									if (pg_err){
									console.error('error running pg_query', pg_err);
									callback();
									}
									else {
										if (pg_rows.length > 0) {
											intersectsCaribbean = true;
										}
									callback();
									}
								});				
							});

							//co-channel Mexico
							asyncTasks.push(function(callback) {
								var q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 220 and a.service in ('FM', 'FA', 'FR') and a.class in ('A', 'AA', 'C1', 'C', 'D') and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 40 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 220 and a.service in ('FM', 'FA', 'FR') and a.class = 'B1' and a.country = 'MX'  and b.uuid = '" + uuid0 + "' and b.dbu = 37 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 220 and a.service in ('FM', 'FA', 'FR') and a.class = 'B' and a.country = 'MX'  and b.uuid = '" + uuid0 + "' and b.dbu = 34 and ST_Intersects(a.geom, b.geom)";
								var vals = [];

								pg_query(q, vals, function(pg_err, pg_rows, pg_res){
									if (pg_err){
									console.error('error running pg_query', pg_err);
									callback();
									}
									else {
									data_co_mex = pg_rows;
									callback();
									}
								});
							});

							//first-adjacent mex
							asyncTasks.push(function(callback) {
								var q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 219 and a.service in ('FM', 'FA', 'FR') and a.class in ('A', 'AA','C1', 'C', 'D') and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 54 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 219 and a.service in ('FM', 'FA', 'FR') and a.class = 'B1' and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 51 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 219 and a.service in ('FM', 'FA', 'FR') and a.class = 'B' and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 48 and ST_Intersects(a.geom, b.geom)";
								var vals = [];

								pg_query(q, vals, function(pg_err, pg_rows, pg_res){
									if (pg_err){
									console.error('error running pg_query', pg_err);
									callback();
									}
									else {
									data_1_mex = pg_rows;
									callback();
									}
								});
							});

							//2nd/3rd-adjacent mex
							asyncTasks.push(function(callback) {
								q = "SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FA', 'FR') and a.class in ('A', 'AA', 'C1', 'C', 'D') and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 100 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FA', 'FR') and a.class = 'B1' and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 97 and ST_Intersects(a.geom, b.geom) \
								union \
								SELECT a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel, a.station_lat, a.station_lon, a.uuid, ST_Area(ST_Intersection(a.geom, b.geom)::geography)/1000000 as area, ST_Area(b.geom::geography)/1000000 as area1 \
								FROM " + pg_schema + ".amr_fm_contours a, " + pg_schema + ".amr_interfering_contours b \
								WHERE a.channel > 217 and a.service in ('FM', 'FA', 'FR') and a.class = 'B' and a.country = 'MX' and b.uuid = '" + uuid0 + "' and b.dbu = 94 and ST_Intersects(a.geom, b.geom)";
								var vals = [];

								pg_query(q, vals, function(pg_err, pg_rows, pg_res){
									if (pg_err){
									console.error('error running pg_query', pg_err);
									callback();
									}
									else {
									data_23_mex = pg_rows;
									callback();
									}
								});
							});


							async.parallel(asyncTasks, function() {

								var location = {
									"latlng": {
										"lat": lat,
										"lng": lon
									},
									"isInsideUs": insideUs
								};
								var entry = {
									"uuid": uuid0,
									"data_co_usa": data_co_usa,
									"data_1_usa": data_1_usa,
									"data_23_usa": data_23_usa,
									"data_co_mex": data_co_mex,
									"data_1_mex": data_1_mex,
									"data_23_mex": data_23_mex,
									"location": location,
									"intersectsCanada": intersectsCanada,
									"intersectsMexico": intersectsMexico,
									"intersectsCaribbean": intersectsCaribbean
								};
								res.send(entry);

							});
						}
	                });
	            }

	        } else {
	            var entry = {
	                "location": {
	                    "latlng": {
	                        "lat": lat,
	                        "lng": lon
	                    },
	                    "isInsideUs": insideUs
	                }
	            };
	            res.send(entry);
	        }
}
	    });
	}
	catch (e) {
		console.error('Exception in amrProcess:'+e);
	}

}


function getLatLonPoint(lat1, lon1, az, d) {
    lat1 = lat1 * Math.PI / 180.0;
    lon1 = lon1 * Math.PI / 180.0;
    az = az * Math.PI / 180.0;

    var R = 6371.0;
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(az));
    var lon2 = lon1 + Math.atan2(Math.sin(az) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

    lat2 = lat2 * 180 / Math.PI;
    lon2 = lon2 * 180 / Math.PI;

    return [lat2, lon2]
}

function interferingContours(req, res) {
    var uuid = req.params.id;
    var url = geo_host + "/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + 
			geo_space + ":amr_interfering_contours&maxFeatures=50&outputFormat=json&sortBy=dbu&cql_filter=uuid='" + uuid + "'";

    http.get(url, function(res1) {
        var data = "";
        res1.on('data', function(chunk) {
            data += chunk;
        });
        res1.on("end", function() {
            res.send(data);
        });
    }).on("error", function() {
        res.send({
			'status': 'error',
			'msg': 'error selecting interfering contours'
		});
    });
}

function fmContours(req, res) {

    var uuid = req.params.id;
    //var url = geo_host + "/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":amr_fm_contours&maxFeatures=50&outputFormat=json&sortBy=area+D&cql_filter=facility_id=" + facility_id + "+AND+filenumber='" + filenumber + "'+AND+class='" + class0 + "'+AND+station_lat=" + station_lat + "+AND+station_lon=" + station_lon + "+AND+service+IN+('FM','FL','FX', 'FA', 'FR')";
    var url = geo_host + "/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":amr_fm_contours&maxFeatures=50&outputFormat=json&sortBy=area+D&cql_filter=uuid='" + uuid + "'";

    http.get(url, function(res1) {
        var data = "";
        res1.on('data', function(chunk) {
            data += chunk;
        });
        res1.on("end", function() {
            res.send(data);
        });
    }).on("error", function() {
        res.send({
			'status': 'error',
			'msg': 'error getting FM contours'
		});
	});
}


function amContour(req, res) {

	try {

	    var callsign = req.params.callsign;

	    var url = geo_host + "/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
	        geo_space + ":amr_am_contours&maxFeatures=50&outputFormat=json&cql_filter=callsign='" +
	        callsign + "'+AND+((class='A'+AND+contour_level=2)+OR+(class IN ('B','C','D')+AND+contour_level=2))";

	    http.get(url, function(res1) {
	        var data = "";
	        res1.on('data', function(chunk) {
	            data += chunk;
	        });
	        res1.on("end", function() {
	            res.send(data);
	        });
	    }).on("error", function() {
	        console.log('error accessing ' + url);
			res.send({
				'status': 'error',
				'msg': 'error selecting AM contours'
			});
	    });
	}
	catch (e) {
		console.error('Exception in amContour:'+e);
	}
}

function fmForAvailableChannel(req, res) {

	try {
	    var channel = parseInt(req.params.channel);
	    var uuid0 = req.params.uuid0;

	    var ch1 = channel - 3;
	    if (ch1 < 218) {
	        ch1 = 218;
	    }
	    var ch2 = channel + 3;
	    if (ch1 > 300) {
	        ch1 = 300;
	    }
	    var configEnv = require('../config/env.json');


	    var pg = require('pg');
	    var client = new pg.Client(PG_DB);

	    client.connect();

	    var q = "WITH tmp_table as \
			(SELECT ST_Buffer(geom::geography, 50000)::geometry as geom1 \
			FROM " + pg_schema + ".amr_interfering_contours WHERE uuid = '" + uuid0 + "' and dbu = 34) \
			SELECT a.uuid, a.callsign, a.filenumber, a.facility_id, a.service, a.class, a.channel \
			FROM " + pg_schema + ".amr_fm_contours a, tmp_table b \
			WHERE a.channel >= " + ch1 + " and a.channel <= " + ch2 + " and a.service in ('FM', 'FL', 'FX', 'FA', 'FR')  and ST_Intersects(a.geom, b.geom1) \
			ORDER BY channel";
		var vals = [];
			
		pg_query(q, vals, function(pg_err, pg_rows, pg_res){
			if (pg_err){
				console.error('error running pg_query', pg_err);
			}
			else {
			var data = pg_rows;
	        if (data.length == 0) {
	            res.send({
	                "features": []
	            });
	        } else {

	            var uuid_tuple = "";
	            for (var i = 0; i < data.length; i++) {
	                uuid_tuple += "'" + data[i].uuid + "',";
	            }
	            uuid_tuple = "(" + uuid_tuple.replace(/,$/, "") + ")";

	            var url = geo_host + "/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + 
							geo_space + ":amr_fm_contours&maxFeatures=500&outputFormat=json&sortBy=area+D&cql_filter=uuid+IN+" + uuid_tuple;
	            http.get(url, function(res1) {
	                var data = "";
	                res1.on('data', function(chunk) {
	                    data += chunk;
	                });
	                res1.on("end", function() {
	                    res.send(data);
	                });
	            }).on("error", function() {
	                console.log('error');
					res.send({
						'status': 'error',
						'msg': 'error getting FM contours'
					});
	            });

	        }

		}
	    });
	}
	catch (e) {
		console.error('Exception in fmForAvailableChannel:'+e);
	}

}




function allAMCallsignList(req, res) {

	try {
		var q = "SELECT distinct callsign FROM " + pg_schema + ".amr_am_contours ORDER BY callsign";
		var vals = [];
				
		pg_query(q, vals, function(pg_err, pg_rows, pg_res){
			if (pg_err){
				console.error('error running pg_query', pg_err);
				res.send({
					'status': 'error',
					'msg': 'error getting AM call sign lists'
				});
			}
			else {
				var data = pg_rows;
				var callsign_list = [];
				for (var i = 0; i < data.length; i++) {
					callsign_list.push(data[i].callsign);
				}
				res.send(callsign_list);
			}
		});
	}
	catch(e) {
		console.error('Exception in allAMCallsignList: '+e);
	}
}

module.exports.mapDeploy = mapDeploy;


module.exports.amrProcess = amrProcess;
module.exports.interferingContours = interferingContours;
module.exports.fmContours = fmContours;
module.exports.amContour = amContour;
module.exports.fmForAvailableChannel = fmForAvailableChannel;
module.exports.allAMCallsignList = allAMCallsignList;