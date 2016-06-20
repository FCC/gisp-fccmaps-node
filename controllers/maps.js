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
var _ = require('lodash');

var request = require('request');

// **********************************************************
//config

var configEnv = require('../config/env.json');

var NODE_ENV = process.env.NODE_ENV;
var CONTENT_API = configEnv[NODE_ENV].CONTENT_API || '/api.json';
var DEPLOY_INTERVAL = configEnv[NODE_ENV].DEPLOY_INTERVAL || 300000; //microseconds

// **********************************************************

var rawDataJson = [];
var newDataJson, oldDataJson;

var apiJson = [];

// **********************************************************

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
		
				oldDataJson = rawDataJson;
				
				var newData = data;
				newData = newData.replace(/\\n/g, '');
				newData = newData.replace(/\\r/g, '');
		
				newDataJson = JSON.parse(newData);				

				console.log('CONTENT_API data received.');

				if (JSON.stringify(newDataJson) != JSON.stringify(oldDataJson)) {
				
					console.log('newDataJson != oldDataJson');
					rawDataJson = newDataJson;
					
					setData(rawDataJson);					
					
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

function validUnique(unique){
	var val = false;
	
	var regex = /^[a-z0-9-]+$/; 
	
	if (unique) {		
		
		if (regex.test(unique)) {
	
			val = true;
		}
		else {
			console.log('unique : ' + unique );
			console.log('regex.test(unique) : ' + regex.test(unique) );
		}
	}
	return val;
}

function setData(raw) {
	
	console.log('\n\n setData');
	
	apiJson = [];  // reset 
	
	for (var i = 0; i < raw.length; i++) {
		
		//console.log('\n setData i : ' + i );
		
		var map_unique, map_type, map_desc, map_title, map_subtitle, map_status, map_rank;
		var status_archive, status_feature;
		var config_frame_height, config_frame_width, config_search_address, config_search_coordinate, config_attribution, config_zoom_max, config_zoom_min;
		var init_zoom, init_lat, init_lon;
		var meta_bureau, meta_bureau_id, meta_bureau_name, meta_bureau_url;
		var date_published, date_reviewed, date_created, date_changed, date_display;
		var url_web, url_thumb;		
		
		if (raw[i].fields) {
		
			map_rank = 1;
			
			map_unique = _.get(raw[i], 'fields.field_map_unique.und[0].value').toLowerCase();
			map_type = _.get(raw[i], 'fields.field_map_type.und[0].value');
			
			map_title = _.get(raw[i], 'title');
			map_subtitle = _.get(raw[i], 'fields.field_subtitle.und[0].value');
			map_desc = _.get(raw[i], 'fields.field_description.und[0].safe_value');
			
			status_archive = _.get(raw[i], 'fields.field_archived.und[0].value'); 
			status_feature = _.get(raw[i], 'fields.field_featured.und[0].value'); 
								
			meta_bureau_id = _.get(raw[i], 'fields.field_bureau_office.und[0].tid').toLowerCase(); 	
			meta_bureau_name = _.get(raw[i], 'fields.field_bureau_office.und[0].value'); 
			meta_bureau_url = _.get(raw[i], 'fields.field_bureau_office.und[0].url'); 
			
			config_frame_height = _.get(raw[i], 'fields.field_frame_size.und[0].height'); 
			config_frame_width = _.get(raw[i], 'fields.field_frame_size.und[0].width'); 
			config_search_address = _.get(raw[i], 'fields.field_map_address_search.und[0].value'); 
			config_search_coordinate = _.get(raw[i], 'mapOptions.fields.field_map_coordinate_search.und[0].value'); 
			config_attribution = _.get(raw[i], 'fields.field_map_attribution.und[0].value'); 
			config_zoom_max = _.get(raw[i], 'fields.field_map_max_zoom.und[0].value'); 
			config_zoom_min = _.get(raw[i], 'fields.field_map_min_zoom.und[0].value'); 
			
			init_zoom = _.get(raw[i], 'fields.field_map_initial_zoom.und[0].value'); 
			init_lat = _.get(raw[i], 'fields.field_map_latitude.und[0].value'); 
			init_lon = _.get(raw[i], 'fields.field_map_longitude.und[0].value'); 

			date_display = _.get(raw[i], 'fields.field_map_display_date.und[0].value'); 			
			date_published = _.get(raw[i], 'fields.field_date.und[0].value');
			date_reviewed = _.get(raw[i], 'fields.field_date_updated_reviewed.und[0].value');
			date_created = _.get(raw[i], 'created');
			date_changed = _.get(raw[i], 'changed');
			
			url_web = _.get(raw[i], 'webUrl');
			url_thumb = _.get(raw[i], 'fields.field_image_thumbnail.und[0].uri');	
			
			if (status_archive == 1) {
				status_archive = true;
			}
			else {
				status_archive = false;
			}
			
			if (status_feature == 1) {
				status_feature = true;
			}
			else {
				status_feature = false;
			}
			
			map_status = 'active';
			if (status_archive) {
				map_status = 'archive';
			}
			if (status_feature) {
				map_status = 'feature';
				map_rank--;
			}
			
			//console.log('map_unique : ' + map_unique );
			//console.log('validUnique(map_unique) : ' + validUnique(map_unique) );
			
			var mapJson = {};
			
			if (validUnique(map_unique)) {				

				/*
				console.log('map_unique : ' + map_unique );
				console.log('map_type : ' + map_type );
				console.log('map_desc : ' + map_desc );
				console.log('map_title : ' + map_title );
				console.log('map_status : ' + map_status );
				console.log('status_archive : ' + status_archive );
				
				console.log('date_created : ' + date_created );
				console.log('date_changed : ' + date_changed );
				
				console.log('url_web : ' + url_web );
				console.log('url_thumb : ' + url_thumb );
				*/
			
				//apiJson[map_unique] = {
				//mapJson[map_unique] = {				
				var itemJson = {					
					'map_id' : map_unique,
					'map_status' : map_status,
					'map_type' : map_type,
					'map_title' : map_title,	
					'map_subtitle' : map_subtitle,
					'map_desc' : map_desc,	
					'map_date' : date_reviewed,	
					'map_rank' : map_rank,	
					
					'status' : {
						'archive' : status_archive,
						'feature' : status_feature
					},
					
					'config' : {
						'attribution' : config_attribution,
						'frame' : {
							'height' : config_frame_height,
							'width' : config_frame_width
						},
						'search' : {
							'address' : config_search_address,
							'coordinate' : config_search_coordinate
						}
					},
					
					'init' : {
						'zoom' : init_zoom,
						'lat' : init_lat,
						'lon' : init_lon
					},
					
					'meta' : {
						'bureau' : {
							'id' : meta_bureau_id, 
							'name' : meta_bureau_name,
							'url' : meta_bureau_url
						}
					},
					
					'date' : {
						'published' : date_published,
						'reviewed' : date_reviewed,						
						'created' : date_created,
						'changed' : date_changed,
						'display' : date_display
					},					
					
					'url' : {
						'web' : url_web,
						'thumb' : url_thumb
					}
				};
				
				apiJson.push(itemJson);
				
				//console.log('apiJson[map_unique] : ' + JSON.stringify(apiJson[map_unique]) );				
			}	
			
		}
	}	
		
	apiJson = _.orderBy(apiJson, ['map_rank', 'map_date', 'map_title'], ['asc', 'desc', 'asc']);
}


// **********************************************************
// resp

function getDataAPI(req, res) {
	
	//console.time("getDataAPI");
	//var startTime = process.hrtime(); 
	
	var id = req.query.id;
	
	var query = req.query.q;	
	var status = req.query.st;
	var bureau = req.query.bo; 
	
	var order = req.query.o;	
	
	//console.log('query : ' + query );	
	//console.log('order : ' + order );	
	//console.log('id : ' + id );	
	//console.log('status : ' + status );	
	//console.log('bureau : ' + bureau );
	
	var outJson = [];
	
	if (id) {				
		var keyJson = _.find(apiJson, {'map_id' : id});		
		//console.log('keyJson : ' + JSON.stringify(keyJson) );
		
		if (keyJson) {
			outJson.push(keyJson);
		}	
	}	
	else if (query || status || bureau || order) {

		outJson = apiJson;
		
		//console.log('filter : ' + JSON.stringify( _.filter(outJson, {'meta' : { 'bureau': { 'id' : bureau }}} ) ) );		
		
		// **********************************************************
		// filter
		
		if (query) {
			query = query.toLowerCase();
			//console.log('query : ' + query );	
	
			outJson = _.filter(outJson, function(item) {	
				var regex = new RegExp(query,'i');				
				return regex.test(item.map_title) || regex.test(item.map_subtitle) || regex.test(item.map_desc);				
			});			
		}				
		
		if (bureau) {
			bureau = bureau.toLowerCase();
			//console.log('bureau : ' + bureau );
			
			outJson = _.filter(outJson, {'meta' : { 'bureau': { 'id' : bureau }}} ); 
		}	
		
		if (status) {
			status = status.toLowerCase();
			//console.log('status : ' + status );
			
			if (status != 'all') {			
				outJson = _.filter(outJson, {'map_status' : status} ); 
			}
		}		
		
		// **********************************************************
		//order 
		if (order) {		
			//console.log('order : ' + order );
			
			var order_arr, order_val, order_type;
			
			order_arr = order.split(',');
			order_val = order_arr[0];
			//console.log('order_val : ' + order_val );
			//console.log('order_arr.length : ' + order_arr.length );
			
			if (order_arr.length == 2) {
				order_type = order_arr[1];
			}
			else {
				order_type = 'asc';
			}
			//console.log(order_type);
			
			if ((order_val == 'title') || (order_val == 'date')) {
			
				if ((order_type == 'asc') || (order_type == 'desc')) {
					outJson = _.orderBy(outJson, ['map_'+order_val, 'map_rank'], [order_type, 'asc']);
				}
			}			
		}
		else {
			outJson = _.orderBy(outJson, ['map_rank', 'map_date', 'map_title'], ['asc', 'desc', 'asc']);
		}
		
	}	
	else {
		outJson = apiJson;
	}
	
	//var diff = process.hrtime(startTime);	
	//console.log(diff[0] * 1000000 + diff[1] / 1000)	
	//console.timeEnd("getDataAPI");	
		
	res.json(outJson);
}

function getRawAPI(req, res) {
	res.json(rawDataJson);
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
	for (var i = 1; i < rawDataJson.length; i++) {
		var map_unique = '';
		if (rawDataJson[i].fields.field_map_unique && rawDataJson[i].fields.field_map_unique.und && rawDataJson[i].fields.field_map_unique.und[0].value) {
			map_unique = rawDataJson[i].fields.field_map_unique.und[0].value;
		}

		if (map_unique == mapId) {
			return true;
		}
	
	}
	
	return false;
}

function getMapType(mapId) {
	var map_type = '';
	for (var i = 1; i < rawDataJson.length; i++) {
		var map_unique = '';
		if (rawDataJson[i].fields.field_map_unique && rawDataJson[i].fields.field_map_unique.und && rawDataJson[i].fields.field_map_unique.und[0].value) {
			map_unique = rawDataJson[i].fields.field_map_unique.und[0].value;
		}

		if (map_unique == mapId) {
			if (rawDataJson[i].fields.field_map_type && rawDataJson[i].fields.field_map_type.und && rawDataJson[i].fields.field_map_type.und[0].value) {
				map_type = rawDataJson[i].fields.field_map_type.und[0].value;
			}
		}
	}
	return map_type;
}

function getWebUrl(mapId) {
	var webUrl = '';
	for (var i = 1; i < rawDataJson.length; i++) {
		var map_unique = '';
		if (rawDataJson[i].fields.field_map_unique && rawDataJson[i].fields.field_map_unique.und && rawDataJson[i].fields.field_map_unique.und[0].value) {
			map_unique = rawDataJson[i].fields.field_map_unique.und[0].value;
		}
		if (map_unique == mapId) {
			if (rawDataJson[i].webUrl) {
				webUrl = rawDataJson[i].webUrl;
			}
		}
	}
	return webUrl;
}

function getThumbUrl(mapId) {
	var thumbUrl = false;
	for (var i = 1; i < rawDataJson.length; i++) {
		var map_unique = '';
		if (rawDataJson[i].fields.field_map_unique && rawDataJson[i].fields.field_map_unique.und && rawDataJson[i].fields.field_map_unique.und[0].value) {
			map_unique = rawDataJson[i].fields.field_map_unique.und[0].value;
		}
		if (map_unique == mapId) {
			if (rawDataJson[i].fields.field_image_thumbnail && rawDataJson[i].fields.field_image_thumbnail.und && rawDataJson[i].fields.field_image_thumbnail.und[0].uri) {
				thumbUrl = rawDataJson[i].fields.field_image_thumbnail.und[0].uri;
			}
		}
	}
	
	return thumbUrl;
}

// **********************************************************
// export

module.exports.deployMap = deployMap;
module.exports.getDataAPI = getDataAPI;
module.exports.getRawAPI = getRawAPI;
module.exports.pullMap = pullMap;
module.exports.checkMapId = checkMapId;
module.exports.getMapType = getMapType;
module.exports.getWebUrl = getWebUrl;
module.exports.getThumbUrl = getThumbUrl;
