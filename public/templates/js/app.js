
	//var geo_host = "http://ldevtm-geo02:8080";
	//var geo_space = "fcc";

	var geo_host = "//www.broadbandmap.gov";
	var geo_space = "fcc";
	
	var map;
	var clickedCountyLayer;
	var clickedBlockLayer;
	var clickedBlock_fips;
	var countyLayerData = {"features" : []};
	var bpr_county_layer_fixed_1;
	var bpr_county_layer_fixed_0;
	var bpr_county_layer;
	var bpr_county_layer_urban;
	var bpr_tribal;
	var locationMarker;
	
	var cursorX;
	var cursorY;
	var clickX = 0;
	var clickY = 0;
	var locationLat;
	var location_lon;
	var lastTimestamp = 0;
	
	var clickedCountyStyle = {color: "#00f", opacity: 0.5,  fillOpacity: 0.1, fillColor: "#fff", weight: 3};
	var clickedBlockStyle = {color: "#000", opacity: 0.5,  fillOpacity: 0.1, fillColor: "#fff", weight: 3};
	var currentSortOrder = {"provider": 0, "technology": -1, "down": -1, "up": -1};
	
	
	function createMap() {
 
     L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
     map = L.mapbox.map('map', 'fcc.k74ed5ge', {
             attributionControl: true,
             maxZoom: 15,
			 minZoom: 3
         })
         .setView([50, -115], 3);
		 
	map.on("dblclick", function(e){ 
		e.preventDefault();
	});
		 
	 baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge').addTo(map);
     baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
     baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');
	 
	var bpr_state = L.tileLayer.wms(geo_host + '/geoserver/wms', {
		format: 'image/png',
		transparent: true,
		layers: geo_space + ':bpr_state_layer'
	});
	 

	bpr_county_layer_fixed_1 = L.tileLayer.wms(geo_host + '/geoserver/gwc/service/wms?tiled=true', {
		format: 'image/png',
		transparent: true,
		layers: geo_space + ':bpr_county_layer_1'
	}).setZIndex(11).addTo(map);
	
	
	
	bpr_county_layer_fixed_0 = L.tileLayer.wms(geo_host + '/geoserver/gwc/service/wms?tiled=true', {
		format: 'image/png',
		transparent: true,
		layers: geo_space + ':bpr_county_layer_0'
	}).setZIndex(12).addTo(map);


	bpr_county_layer_urban = L.tileLayer.wms(geo_host + '/geoserver/wms', {
		format: 'image/png',
		transparent: true,
		layers: geo_space + ':bpr_county_layer_urban_only',
		styles: 'bpr_layer_urban'
	}).setZIndex(13);
	
	bpr_tribal = L.tileLayer.wms(geo_host + '/geoserver/wms', {
		format: 'image/png',
		transparent: true,
		layers: geo_space + ':bpr_tribal',
		styles: 'bpr_tribal'
	}).setZIndex(14);
	
	
	
	layerControl = new L.Control.Layers({
         'Street': baseStreet.addTo(map),
         'Satellite': baseSatellite,
         'Terrain': baseTerrain
     }, {

     }, {
		position: 'topleft'
	 }
	 ).addTo(map);
		 
	 L.control.scale({
         position: 'bottomleft'
     }).addTo(map);

     geocoder = L.mapbox.geocoder('mapbox.places-v1');

	 map.on("click", function(e) {
		clickedMap(e);
	});
	  
	}
	
function clickedMap(e) {

	timestamp = Date.now();
	console.log(timestamp);
	if (lastTimestamp > 0 && timestamp-lastTimestamp < 1000) {
		lastTimestamp = timestamp;
		return;
	}
	lastTimestamp = timestamp;
	clickX = cursorX;
	clickY = cursorY;
	var lat = Math.round(1000000*e.latlng.lat)/1000000.0;
	var lng = Math.round(1000000*e.latlng.lng)/1000000.0;
	locationLat = lat;
	locationLon = lng;
	
	removeBlockCountyLayers();

	fetchCounty(lat, lng);
	setTimeout(function () {fetchBlock(lat, lng)}, 200);
}


function removeBlockCountyLayers() {
	if (map.hasLayer(clickedCountyLayer)) {
		map.removeLayer(clickedCountyLayer);
	}
	if (map.hasLayer(clickedBlockLayer)) {
		map.removeLayer(clickedBlockLayer);
	}
	if (map.hasLayer(locationMarker)) {
		map.removeLayer(locationMarker);
	}
}

function writeIntro() {

var text = "<p style=\"line-height: 150%\">Click on the map or search for a location using an address or coordinates to display provider and demographic information.<br><br>" +
	"Example Searches:<br><ul>" +
	"<li>148 Lafayette Street, New York, NY 10013<br>" +
	"<li>Lumberport, WV" +
	"<li>Latitude: 40.566353, Longitude: -105.094573" +
	"</ul></p>";
	
$('#display-block').html(text);

}
	
	
function addComma(a) {
	var a = "" + a;
	if (a.length == 0) {
	return a;
	}

	var decimal_part = "";
	var integer_part = a;
	if (a.match(/\./)) {
	integer_part = a.split(".")[0];
	decimal_part = a.split(".")[1];
	}

	var len = integer_part.length;
	var str = "";
	for (var i = 0; i < len; i++) {
	if ((len - i -1) % 3 == 0 && (len - i -1) > 0) {
	str += integer_part[i] + ",";
	} 
	else {
	str += integer_part[i];
	}
	}

	var ret = str;
	if (decimal_part != "") {
	var ret = str + "." + decimal_part
	}

	return ret;
}





function fetchCounty(lat, lng) {

	//var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_county&maxFeatures=1&outputFormat=text/javascript&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))";
	var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_county&maxFeatures=1&outputFormat=json&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))" + "&format_options=callback:parseResponse";

	console.log(url)
	//remove county layer
	if (map.hasLayer(clickedCountyLayer)) {
		map.removeLayer(clickedCountyLayer);
	}

	$.ajax({
		type: "GET",
		url: url,
		dataType: "jsonp",
		jsonpCallback: "parseResponse",
		success: function(data) {
		
			if (data.features.length == 0) {
				var county_text = "No county data found at your searched/clicked location.";
				$('#display-county').html(county_text);
				return;
			}
		
			var id = data.features[0].id.replace(/\..*$/, "");
			console.log('county: ' + id); 
			
			if (id != "bpr_county") {
				return;
			}

			if (map.hasLayer(clickedCountyLayer)) {
				map.removeLayer(clickedCountyLayer);
			}
			clickedCountyLayer = L.mapbox.featureLayer(data).setStyle(clickedCountyStyle).addTo(map);
			if (countyLayerData.features.length == 0 || countyLayerData.features[0].properties.county_fips != data.features[0].properties.county_fips) {
				map.fitBounds(clickedCountyLayer.getBounds());
			}
			clickedCountyLayer.on("click", function(e) {
				clickedMap(e);
			});
			
			//get county info
			
			var a = addComma(12345678.998);
			
			var p = data.features[0].properties;
			var urbanunscent = Math.round(p.urbanunscent*100*10) / 10;
			var ruralunscent = Math.round(p.ruralunscent*100*10) / 10;
			var density1 = parseFloat(p.allden);
			if (density1 > 10) {
				var density = Math.round(density1);
			}
			else {
				var density = Math.round(density1 * 100) / 100;
			}
			
			var text = "<span class=\"county-name\">" + p.county_name + ", " + p.state_abbr + "</span><p><p>";
			
			text += "<table width=100% class=\"county-table\">";
			text += "<tr><td>Total Population:</td><td class=\"td-value\"> " + addComma(p.alltotalpop) + "</td></tr>" +
					"<tr><td>Pop Density (pop/mi<sup>2</sup>):</td><td class=\"td-value\"> " + addComma(density)  + "</td></tr>" +
					"<tr><td>Per Capita Income: </td><td class=\"td-value\">" + "$" + addComma(p.percapinc) + "</td></tr>" +
					"<tr><td>Total Pop w/o Access: </td><td class=\"td-value\">" + addComma(p.allunspop) + "</td></tr>" +
					"<tr><td>Percent Urban Pop w/o Access: </td><td class=\"td-value\">" + urbanunscent + "%</td></tr>" + 
					"<tr><td>Percent Rural Pop w/o Access: </td><td class=\"td-value\">" + ruralunscent + "%</td></tr>";

					
			text += "</table>";
			
			$('#display-county').html(text);
			countyLayerData = data;
		
		}
	});

}
	
function fetchBlock(lat, lng) {

	//var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_block_layer&maxFeatures=1&outputFormat=text/javascript&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))";
	var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_block_layer&maxFeatures=1&outputFormat=json&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))"  + "&format_options=callback:parseResponse";
;

	console.log(url)
	
	$.ajax({
		type: "GET",
		url: url,
		dataType: "jsonp",
		jsonpCallback: "parseResponse",
		success: function(data) {
		
			if (data.features.length == 0) {
				var block_text = "No block data found at your searched/clicked location.";
				$('#display-block').html(block_text);
				return;
			}
				
			var id = data.features[0].id.replace(/\..*$/, "");
			if (id != "bpr_block_layer") {
				return;
			}
	
			clickedBlockLayerData = data;
			
			var block_fips = data.features[0].properties.block_fips;
			clickedBlock_fips = block_fips;
			
			if (map.hasLayer(clickedBlockLayer)) {
				map.removeLayer(clickedBlockLayer);
			}
			clickedBlockLayer = L.mapbox.featureLayer(clickedBlockLayerData).setStyle(clickedBlockStyle).addTo(map);

			//map.fitBounds(clickedBlockLayer.getBounds());
			clickedBlockLayer.on("click", function(e) {
			clickedMap(e);
			});
			setLocationMarker(locationLat, locationLon);
			
			var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_block_info&maxFeatures=100&outputFormat=text/javascript&cql_filter=block_fips='" + block_fips + "'";
			var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":bpr_block_info&maxFeatures=100&outputFormat=json&cql_filter=block_fips='" + block_fips + "'" + "&format_options=callback:parseResponse";

			console.log(url)
		
			$.ajax({
				type: "GET",
				url: url,
				dataType: "jsonp",
				jsonpCallback: "parseResponse",
				success: function(data) {
				
					if (data.features.length == 0) {
						var blockType = clickedBlockLayerData.features[0].properties.urban_rural_ind;
						var type = "Rural";
						if (blockType == 'U') {
							type = "Urban";
						}
						var block_text = "<span class=\"block-title\"> Census Block FIPS Code: </span><span class=\"block-text\">" + clickedBlock_fips + "</span><br>";
						block_text += "<span class=\"block-title\"> Census Block Designation: </span><span class=\"block-text\">" + type + "</span><p>";
						block_text += "<br>No data for the clicked block.";
						$('#display-block').html(block_text);
						return;
					}
				
					var id = data.features[0].id.replace(/\..*$/, "");
					if (id != "bpr_block_info") {
						return;
					}

					var block_text = "";
					blockInfoData = [];
					
					if (data.features.length > 0) {
						for (var i =0; i < data.features.length; i++) {
						var p = data.features[i].properties;
						blockInfoData.push(p);
						}
						
						blockInfoData.sort(sort_dbaname_0);
						block_text = makeBlockText();
					}
					else {
						block_text = "No data for clicked block.";
					
					}
					
					$('#display-block').html(block_text);
					
					$('.sort-item').on("click", function(e) {
						sortItems(e);
					});

				}
			});
			
			}
	});
	
}


function parseResponse(data) {

}


function setLocationMarker(lat, lon) {
	if (map.hasLayer(locationMarker)) {
		map.removeLayer(locationMarker);
	}
	locationMarker = L.marker([lat, lon],{title: ""}).addTo(map);
	locationMarker.on("click", function(e) {
	zoomToBlock(e);
	});
}


function zoomToBlock(e) {
	if (map.hasLayer(clickedBlockLayer)) {
	map.fitBounds(clickedBlockLayer.getBounds());
	}
}

	
function sortItems(e) {

	if (e.target.id == 'span-provider') {
		if (currentSortOrder.provider == 1) {
			blockInfoData.sort(sort_dbaname_0);
			currentSortOrder.provider = 0;
			currentSortOrder.technology = 0;
		}
		else {
			blockInfoData.sort(sort_dbaname_1);
			currentSortOrder.provider = 1;
			currentSortOrder.technology = 1;
		}
	}
	else if (e.target.id == 'span-technology') {
		if (currentSortOrder.technology == 1) {
			blockInfoData.sort(sort_technology_0);
			currentSortOrder.technology = 0;
			currentSortOrder.down = 0;
		}
		else {
			blockInfoData.sort(sort_technology_1);
			currentSortOrder.technology = 1;
			currentSortOrder.down = 1;
		}
	}
	else if (e.target.id == 'span-download-speed') {
		if (currentSortOrder.down == 1) {
			blockInfoData.sort(sort_download_0);
			currentSortOrder.down = 0;
			currentSortOrder.up = 0;
		}
		else {
			blockInfoData.sort(sort_download_1);
			currentSortOrder.down = 1;
			currentSortOrder.up = 1;
		}
	}
	else if (e.target.id == 'span-upload-speed') {
		if (currentSortOrder.up == 1) {
			blockInfoData.sort(sort_upload_0);
			currentSortOrder.up = 0;
			currentSortOrder.down = 0;
		}
		else {
			blockInfoData.sort(sort_upload_1);
			currentSortOrder.up = 1;
			currentSortOrder.down = 1;
		}
	}
	
	block_text = makeBlockText();
	$('#display-block').html(block_text);
	$('.sort-item').on("click", function(e) {
		sortItems(e);
	});


}
	

function sort_dbaname_0(a,b) {
	if (a.dbaname == b.dbaname) {
		if (a.technology < b.technology) {return -1;}
		else if (a.technology > b.technology) { return 1;}
		else {return 0;}
	}
	else {
		if (a.dbaname < b.dbaname) {return -1;}
		else if (a.dbaname > b.dbaname) { return 1;}
	}
}

function sort_dbaname_1(a,b) {
	if (a.dbaname == b.dbaname) {
		if (a.technology > b.technology) {return -1;}
		else if (a.technology < b.technology) { return 1;}
		else {return 0;}
	}
	else {
		if (a.dbaname > b.dbaname) {return -1;}
		else if (a.dbaname < b.dbaname) { return 1;}
	}
}

function sort_technology_0(a,b) {
	if (a.technology == b.technology) {
		if (a.download_speed < b.download_speed) {return -1;}
		else if (a.download_speed > b.download_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.technology < b.technology) {return -1;}
		else if (a.technology > b.technology) { return 1;}
	}
}

function sort_technology_1(a,b) {
	if (a.technology == b.technology) {
		if (a.download_speed > b.download_speed) {return -1;}
		else if (a.download_speed < b.download_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.technology > b.technology) {return -1;}
		else if (a.technology < b.technology) { return 1;}
	}
}

function sort_download_0(a,b) {
	if (a.download_speed == b.download_speed) {
		if (a.upload_speed < b.upload_speed) {return -1;}
		else if (a.upload_speed > b.upload_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.download_speed < b.download_speed) {return -1;}
		else if (a.download_speed > b.download_speed) { return 1;}
	}
}

function sort_download_1(a,b) {
	if (a.download_speed == b.download_speed) {
		if (a.upload_speed > b.upload_speed) {return -1;}
		else if (a.upload_speed < b.upload_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.download_speed > b.download_speed) {return -1;}
		else if (a.download_speed < b.download_speed) { return 1;}
	}
}

function sort_upload_0(a,b) {
	if (a.upload_speed == b.upload_speed) {
		if (a.download_speed < b.download_speed) {return -1;}
		else if (a.download_speed > b.download_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.upload_speed < b.upload_speed) {return -1;}
		else if (a.upload_speed > b.upload_speed) { return 1;}
	}
}

function sort_upload_1(a,b) {
	if (a.upload_speed == b.upload_speed) {
		if (a.download_speed > b.download_speed) {return -1;}
		else if (a.download_speed < b.download_speed) { return 1;}
		else {return 0;}
	}
	else {
		if (a.upload_speed > b.upload_speed) {return -1;}
		else if (a.upload_speed < b.upload_speed) { return 1;}
	}
}


function makeBlockText() {
	var blockType = clickedBlockLayerData.features[0].properties.urban_rural_ind;
	var type = "Rural";
	if (blockType == 'U') {
		type = "Urban";
	}
	var text = "<span class=\"block-title\"> Census Block FIPS Code: </span><span class=\"block-text\">" + clickedBlock_fips + "</span><br>";
	text += "<span class=\"block-title\"> Census Block Designation: </span><span class=\"block-text\">" + type + "</span><p>";
	text += "<table class=\"block-table\"><tr><td><span title=\"Provider Name\">Provider</span> <span id=\"span-provider\" class=\"sort-item ui-icon ui-icon-triangle-2-n-s\" style=\"display: inline-block\"></span>  </td>" + 
		"<td class=\"td-space\"></td><td><span title=\"Technology Type\">Tech</span> <span id=\"span-technology\" class=\"sort-item glyphicon  ui-icon ui-icon-triangle-2-n-s\" style=\"display: inline-block\"></span></td>" + 
		"<td class=\"td-right\"><span title=\"Download Speed (mbps)\">Down</span> <span id=\"span-download-speed\" class=\"sort-item glyphicon  ui-icon ui-icon-triangle-2-n-s\" style=\"display: inline-block\"></span></td>" + 
		"<td class=\"td-space\"></td><td class=\"td-right\"><span title=\"Upload Speed (mbps)\">Up</span> <span id=\"span-upload-speed\" class=\"sort-item ui-icon ui-icon-triangle-2-n-s\" style=\"display: inline-block\"></span></td></tr>";
	for (var i = 0; i < blockInfoData.length; i++) {
		text += "<tr><td><span title=\"" + blockInfoData[i].dbaname + "\">" + blockInfoData[i].dbaname.substr(0,10) + "<td class=\"td-space\"></td></td><td>" + blockInfoData[i].technology +
		"</td><td class=\"td-right\">" + blockInfoData[i].download_speed + "<td class=\"td-space\"></td><td class=\"td-right\">" + blockInfoData[i].upload_speed + "</td></tr>"; 
	}
	text += "</table>";

	return text;
}	

function showLoader(a) {
if (a == "clicked") {
$('#ajax-loader').css({"top": clickY-16, "left": clickX-16});
}
else if (a == "center") {
var scrollTop     = $(window).scrollTop();
    var mapTop = $('#map').offset().top;
	var mapLeft = $('#map').offset().left;
	var mapWidth = $('#map').css("width").replace("px", "");
	var mapHeight = $('#map').css("height").replace("px", "");
	var top = mapTop - scrollTop + Math.round(mapHeight/2);
	var left = mapLeft + Math.round(mapWidth/2);
	$('#ajax-loader').css({"top": top, "left": left});
}
}

function hideLoader() {
$('#ajax-loader').css({"top": "-200px", "left": "-300px"});
}

	
function search_dms() {

var lat_deg = $('#lat-deg').val();
var lat_min = $('#lat-min').val();
var lat_sec = $('#lat-sec').val();
var ns = $('#select-ns').val();
var lon_deg = $('#lon-deg').val();
var lon_min = $('#lon-min').val();
var lon_sec = $('#lon-sec').val();
var ew = $('#select-ew').val();
if (lat_deg == "" || lon_deg == "") {
alert("empty fields");
return;
}

lat_deg = Math.floor(lat_deg);
lat_min = Math.floor(lat_min);
if (lat_sec == "") {
	lat_sec = 0;
}
lat_sec = parseFloat(lat_sec);
var lat = lat_deg + lat_min/60.0 + lat_sec/3600.0;
lat = Math.round(lat*1000000) / 1000000.0;

if (ns == "S") {
	lat = -1 * lat;
}

lon_deg = Math.floor(lon_deg);
lon_min = Math.floor(lon_min);
if (lon_sec == "") {
	lon_sec = 0;
}
lon_sec = parseFloat(lon_sec);
var lon = lon_deg + lon_min/60.0 + lon_sec/3600.0;
lon = Math.round(lon*1000000)/1000000.0;

if (ew == "W") {
	lon = -1 * lon;
}

if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
	alert("Lat/Lon values out of range");
	return;
}

	locationLat = lat;
	locationLon = lon;
	fetchCounty(lat, lon);
	setTimeout(function () {fetchBlock(lat, lon)}, 200);
}
	

function search_decimal() {

var lat = $('#latitude').val().replace(/ +/g, "");
var lon = $('#longitude').val().replace(/ +/g, "");

if (lat == "" || lon == "") {
alert("Please enter lat/lon");
return;
}

if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
	alert("Lat/Lon values out of range");
	return;
}


	removeBlockCountyLayers();

	locationLat = lat;
	locationLon = lon;
	fetchCounty(lat, lon);
	setTimeout(function () {fetchBlock(lat, lon)}, 200);

} 
	
function locChange() {

	removeBlockCountyLayers();
	
	var loc = $("#input-location").val();
	geocoder.query(loc, codeMap);
	
	function codeMap(err, data) {

	if (data.results.features.length == 0) {
		alert("No results found");
		return;
	}
	var lat = data.latlng[0];
	var lon = data.latlng[1];
	locationLat = lat;
	locationLon = lon;
	
	fetchCounty(lat, lon);
	setTimeout(function () {fetchBlock(lat, lon)}, 200);

 }
}


function searchLocation() {
locChange();

}

function switchTab(tab) {

	if (tab == "county") {
		$("#display-county").css("display", "block");
		$("#display-block").css("display", "none");

		//highlight county tab
		$('#tab-county').css("background-color", "#666ccc");
		$('#tab-county').css("color", "#ffffff");
		//de-highlight block tab
		$('#tab-block').css("background-color", "#ffffff");
		$('#tab-block').css("color", "#000000");
	}
	else if (tab == "block") {
		$("#display-county").css("display", "none");
		$("#display-block").css("display", "block");

		//highlight block tab
		$('#tab-block').css("background-color", "#666ccc");
		$('#tab-block').css("color", "#ffffff");
		//de-highlight county tab
		$('#tab-county').css("background-color", "#ffffff");
		$('#tab-county').css("color", "#000000");
	}

}

	
function setupListener() {

$('#tab-county, #tab-block').on("click", function(e) {
var id = e.target.id;
if (id == "tab-block") {

switchTab("block");

//zoom to block
if (map.hasLayer(clickedBlockLayer)) {
map.fitBounds(clickedBlockLayer.getBounds());
}

}
if (id == "tab-county") {
switchTab("county");
//zoom to county
if (map.hasLayer(clickedCountyLayer)) {
map.fitBounds(clickedCountyLayer.getBounds());
}

}

});


$('.checkbox-legend').on("click", function(e) {
var id = e.target.id;

if (id == "checkbox-fixed-1") {
	//remove layer
	if (map.hasLayer(bpr_county_layer_fixed_1)) {
	map.removeLayer(bpr_county_layer_fixed_1);
	}
	if($('#' + id).prop('checked')) {
	//add layer
	bpr_county_layer_fixed_1.addTo(map);
	}
}
else if (id == "checkbox-fixed-0") {
	//remove layer
	if (map.hasLayer(bpr_county_layer_fixed_0)) {
	map.removeLayer(bpr_county_layer_fixed_0);
	}
	if($('#' + id).prop('checked')) {
	//add layer
	bpr_county_layer_fixed_0.addTo(map);
	}
}
else if (id == "checkbox-tribal") {
	//remove layer
	if (map.hasLayer(bpr_tribal)) {
	map.removeLayer(bpr_tribal);
	}
	if($('#' + id).prop('checked')) {
	//add layer
	bpr_tribal.addTo(map);
	}
}
else if (id == "checkbox-urban") {
	//remove layer
	if (map.hasLayer(bpr_county_layer_urban)) {
	map.removeLayer(bpr_county_layer_urban);
	}
	if($('#' + id).prop('checked')) {
	//add layer
	bpr_county_layer_urban.addTo(map);
	}
}

});




$(document).on("mousemove", function(e) {
cursorX = e.pageX;
cursorY = e.pageY;
});

     $("#input-loc-search").on("click", function(e) {
         e.preventDefault();
         locChange();
     });

	 $("#input-latlon-dms-search").on("click", function(e) {
         e.preventDefault();
         search_dms();
     });
	 
	 $("#input-latlon-decimal-search").on("click", function(e) {
         e.preventDefault();
         search_decimal();
     });
	 
	$("#input-search-switch").on('click', 'a', function(e) {
		var search = $(e.currentTarget).data('value');
		
		e.preventDefault();	

		if (search == 'loc') {
			$("#input-latlon-dms").css('display', 'none');
			$("#span-latlon-dms-search").css('display', 'none');
			$("#input-latlon-decimal").css('display', 'none');
			$("#span-latlon-decimal-search").css('display', 'none');

			$("#input-location").css('display', 'block');
			$("#span-location-search").css('display', 'table-cell');
			$("#btn-label").text('Address');
        }
		
        else if (search == 'latlon-dms') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-latlon-decimal").css('display', 'none');
			$("#span-latlon-decimal-search").css('display', 'none');
		
            $("#input-latlon-dms").css('display', 'block');
            $("#span-latlon-dms-search").css('display', 'table-cell');
			$("#btn-label").text('Lat/lon (DMS)');
        }
		
		
        else if (search == 'latlon-decimal') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-latlon-dms").css('display', 'none');
			$("#span-latlon-dms-search").css('display', 'none');
			
            $("#input-latlon-decimal").css('display', 'block');
            $("#span-latlon-decimal-search").css('display', 'table-cell');
			$("#btn-label").text('Coordinates');
        }
	
	});
	
	$('#input-location').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-loc-search').click();
	    return false;  
	  }
	}); 
	
	
	$('#lat-deg, #lon-deg, #lat-min, #lon-min, #lat-sec, #lon-sec, #select-ns, #select-ew').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-latlon-dms-search').click();
	    return false;  
	  }
	});
	
		
	$('#latitude, #longitude').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-latlon-decimal-search').click();
	    return false;  
	  }
	});
	
     $('#btn-geoLocation').click(function(event) {
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(function(position) {
                 var geo_lat = position.coords.latitude;
                 var geo_lon = position.coords.longitude;
                 var geo_acc = position.coords.accuracy;
				 
				 geo_lat = Math.round(geo_lat * 1000000) / 1000000.0;
				 geo_lon = Math.round(geo_lon * 1000000) / 1000000.0;
				 locationLat = geo_lat;
				locationLon = geo_lon;

                fetchCounty(geo_lat, geo_lon);
				setTimeout(function () {fetchBlock(geo_lat, geo_lon)}, 200);

             }, function(error) {
                 //alert('Error occurred. Error code: ' + error.code);			 
                 alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.');
             }, {
                 timeout: 4000
             });
         } else {
             alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.');
         }

         return false;
     });

	$("#btn-nationLocation").on("click", function() {
         //map.fitBounds(bounds_us);
		 map.setView([50, -115], 3);
     });
	

	$( "#input-location" ).autocomplete({
        source: function( request, response ) {
			var location = request.term;
			geocoder.query(location, processAddress);
			
			function processAddress(err, data) {
			
			var f = data.results.features;
			var addresses = [];
			for (var i = 0; i < f.length; i++) {
				addresses.push(f[i].place_name);
			}
			response(addresses);

			}
        },
        minLength: 3,
        select: function( event, ui ) {
            setTimeout(function() {searchLocation();}, 200);
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
	
}


$(document).ready(function() {
	createMap();
	setupListener();
	writeIntro();
	
});
