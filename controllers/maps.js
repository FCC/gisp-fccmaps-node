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
var validator = require('validator');

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

var api_json = [];

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

// **********************************************************
function validUnique(unique){
	var valid = false;
	
	var regex = /^[a-z0-9-]+$/; 
	
	if (unique) {		
		
		if (regex.test(unique)) {
	
			valid = true;
		}
		else {
			console.log('unique : ' + unique );
			console.log('regex.test(unique) : ' + regex.test(unique) );
		}
	}
	return valid;
}

// **********************************************************
function setData(raw) {
	
	console.log('\n\n setData');
	
	api_json = [];  // reset 
	
	console.log('raw.length : ' + raw.length );
	
	for (var i = 0; i < raw.length; i++) {
		
		//console.log('\n setData i : ' + i );
		
		var map_unique, map_type, map_desc, map_title, map_subtitle, map_status, map_rank;
		var status_archive, status_feature;
		var config_frame_height, config_frame_width, config_search_address, config_search_coordinate, config_attribution, config_zoom_max, config_zoom_min;
		var init_zoom, init_lat, init_lon;
		var samp_zoom, samp_lat, samp_lon;
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
			
			samp_zoom = _.get(raw[i], 'fields.field_thumb_initial_position.und[0].zoom'); 
			samp_lat = _.get(raw[i], 'fields.field_thumb_initial_position.und[0].lat'); 
			samp_lon = _.get(raw[i], 'fields.field_thumb_initial_position.und[0].long');

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
																
			// **********************************************************
			var map_json = {};
			var item_json;
			
			if (validUnique(map_unique)) {
			
				console.log('\n\n map_unique : ' + map_unique );
				//console.log('map_type : ' + map_type );				
				
			
				//api_json[map_unique] = {
				//map_json[map_unique] = {				
				item_json = {					
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
						'zoom': {
							'max': config_zoom_max,
							'min': config_zoom_min
						},
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
					
					'sample' : {
						'zoom' : samp_zoom,
						'lat' : samp_lat,
						'lon' : samp_lon
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
				
				// **********************************************************
				// layers
				var layer_arr, layers_json, layer_json, layer_visibility;
			
				layer_arr = _.get(raw[i], 'fields.field_map_layer');	
				//console.log('\n layer_arr : ' + JSON.stringify(layer_arr) );
						
				if (layer_arr) {  // && (map_type == 'layers')) {
					
					layers_json = [];
					layer_json;
					
					//console.log('layer_arr.length : ' + layer_arr.length );		
					
					for (var j = 0; j < layer_arr.length; j++) {
					
						layer_visibility = _.get(layer_arr[j], 'field_layer_visibility.und[0].value');
						if (layer_visibility == 'on') {
							layer_visibility = true;
						}
						else {
							layer_visibility = false;
						}
												
						layer_json = {
							'type': _.get(layer_arr[j], 'field_layer_type.und[0].value'),
							'domain' : _.get(layer_arr[j], 'field_layer_domain.und[0].value'), 
							'format' : _.get(layer_arr[j], 'field_layer_format.und[0].value'),
							'name' : _.get(layer_arr[j], 'field_layer_name.und[0].value'),
							'opacity' : _.get(layer_arr[j], 'field_layer_opacity.und[0].value'),
							'protocol' : _.get(layer_arr[j], 'field_layer_protocol.und[0].value'),
							'title' : _.get(layer_arr[j], 'field_layer_title.und[0].value'),
							'query' : _.get(layer_arr[j], 'field_layer_query_string.und[0].value'),
							'style' : _.get(layer_arr[j], 'field_layer_style.und[0].value'),							
							'visibile' : layer_visibility
						};
						layers_json.push(layer_json);
					}
					
					if (layers_json) {
						item_json.layers = layers_json;
					}
				}
				
				// **********************************************************
				// legends
				var legend_arr, legends_json, legend_json;
			
				legend_arr = _.get(raw[i], 'fields.field_map_legend');	
				//console.log('\n legend_arr : ' + JSON.stringify(legend_arr) );
						
				if (legend_arr) {  // && (map_type == 'layers')) {
					
					legends_json = [];
					legend_json;
					
					//console.log('legend_arr.length : ' + legend_arr.length );		
					
					for (var k = 0; k < legend_arr.length; k++) {		
												
						legend_json = {
							'color' : _.get(legend_arr[k], 'field_legend_color.und[0].value'), 
							'text' : _.get(legend_arr[k], 'field_legend_text.und[0].value')							
						};
						legends_json.push(legend_json);
					}
					
					if (legends_json) {
						item_json.legends = legends_json;
					}
				}
				
				// **********************************************************
				// tags
				var tag_arr, tags_json, tag_name, tag_url;
			
				tag_arr = _.get(raw[i], 'taxonomy');	
				//console.log('\n tag_arr : ' + JSON.stringify(tag_arr) );
						
				if (tag_arr) {  // && (map_type == 'layers')) {
					
					tags_json = [];
					
					//console.log('tag_arr.length : ' + tag_arr.length );		
					
					for (var m = 0; m < tag_arr.length; m++) {
					
						tag_name = _.get(tag_arr[m], 'name');
						tag_url = _.get(tag_arr[m], 'url');
						
						if ((tag_name != 'Data, Maps, Reports') && (tag_name != 'Maps') && (tag_name != 'Reports')) { // do not include generic tags
							tags_json.push({name: tag_name, url: tag_url});
						}				
						
					}
					
					if (tags_json) {
						item_json.tags = tags_json;
					}
				}
				
				// **********************************************************
				// links
				var link_arr, links_json, link_json, link_title, link_url;
			
				link_arr = _.get(raw[i], 'fields.field_related_links.und');	
				console.log('\n link_arr : ' + JSON.stringify(link_arr) );
						
				if (link_arr) {  // && (map_type == 'layers')) {
					
					links_json = [];
					link_json;
					
					console.log('link_arr.length : ' + link_arr.length );		
					
					for (var n = 0; n < link_arr.length; n++) {
					
						link_title = _.get(link_arr[n], 'title');
						link_url = _.get(link_arr[n], 'url');
						
						link_json = {
							'title' : link_title,
							'url' : link_url						
						};
						
						console.log('link_title : ' + link_title );	
						console.log('link_url : ' + link_url );	
						
						if (link_url) {												
							if (validator.isURL(link_url) ) {
								links_json.push(link_json);
							}	
						}
					}
					
					if (links_json) {
						item_json.links = links_json;
					}
				}
				
				
				// **********************************************************
				api_json.push(item_json);
				
				//console.log('api_json[map_unique] : ' + JSON.stringify(api_json[map_unique]) );				
			}	
			
		}
	}	
		
	api_json = _.orderBy(api_json, ['map_rank', 'map_date', 'map_title'], ['asc', 'desc', 'asc']);
	
	// console.log(api_json);
	
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
		var keyJson = _.find(api_json, {'map_id' : id});		
		//console.log('keyJson : ' + JSON.stringify(keyJson) );
		
		if (keyJson) {
			outJson.push(keyJson);
		}	
	}	
	else if (query || status || bureau || order) {

		outJson = api_json;
		
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
		
		if (status) {  // active, feature, archive, all (everything), current (active & feature)
			status = status.toLowerCase();
			//console.log('status : ' + status );
			
			if (status != 'all') {			
				//outJson = _.filter(outJson, {'map_status' : status} ); 
				
				outJson = _.filter(outJson, function(item) {				
					if (status == 'current') {								
						return item.map_status == 'active' || item.map_status == 'feature';
					}
					else {
						return item.map_status == status;
					}
				});		
				
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
		outJson = api_json;
	}
	
	//var diff = process.hrtime(startTime);	
	//console.log(diff[0] * 1000000 + diff[1] / 1000)	
	//console.timeEnd("getDataAPI");	
		
	res.json(outJson);
}

// **********************************************************
function getRawAPI(req, res) {
	res.json(rawDataJson);
}

// **********************************************************
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

// **********************************************************
function checkMapId(mapId) {
	console.log('check map id ' + mapId);
	
	var map_json = _.find(api_json, {'map_id' : mapId});
	
	if ((map_json) && (map_json.map_id == mapId)) {
		console.log('checkMapId true ');
		return true;
	}	
	
	return false;
}

function getMapType(mapId) {
	var map_type = '';
	var map_json = _.find(api_json, {'map_id' : mapId});	
	
	if (map_json) {
		map_type = map_json.map_type;
		console.log('map_type : ' + map_type );
	}
	return map_type;
}

function getWebUrl(mapId) {
	var webUrl = '';
	var map_json = _.find(api_json, {'map_id' : mapId});	
	
	if (map_json) {
		webUrl = map_json.url.web;
		console.log('webUrl : ' + webUrl );
	}
	return webUrl;
}

function getThumbUrl(mapId) {
	var thumbUrl = false;
	
	var map_json = _.find(api_json, {'map_id' : mapId});	
	
	if (map_json) {
		thumbUrl = map_json.url.thumb;
		console.log('thumbUrl : ' + thumbUrl );
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
