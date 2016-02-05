
	var map;
	var contour_json;
	var station_marker;
	var interferingContoursNow;
	var interferingContours_layer;
	var interferingContoursHighlight_layer;
	var allFMContoursNow;
	var fmContours_layer;
	var fmContoursHighlight_layer;
	var amStation_layer;
	var amProcessNow;
	var interferenceType;
	var uuid4InterferringContour;
	var channelClicked;
	var allAMCallsignList = [];
	var translatorLat = "";
	var translatorLon = "";
	var dbuNow;
	var channelInfo;
	var translatorMarker;
	var translatorMarker_tmp;
	
	var cursorX;
	var cursorY;
	var clickX = 0;
	var clickY = 0;

	var geo_host = "http://amr-geoserv-tc-dev01.elasticbeanstalk.com";
	var geo_space = "amr";
	//var geo_host = "http://ldevtm-geo02:8080/geoserver";
	//var geo_space = "geo_swat";

	var contour_style = {color: "#f00", opacity: 1.0,  fillOpacity: 0.1, fillColor: "#faa", weight: 2};
	var contour_style_highlight = {color: "#ff0", opacity: 1.0,  fillOpacity: 0.1, fillColor: "#fff", weight: 3};
	var contour_style_highlight_fm = {color: "#ff0", opacity: 1.0,  fillOpacity: 0.1, fillColor: "#fff", weight: 7};
	var contour_style_fm = {color: "#00f", opacity: 1.0,  fillOpacity: 0, fillColor: "#00f", weight: 2};
	var contour_style_fm_co_1 = {color: "#999", opacity: 1.0,  fillOpacity: 0, fillColor: "#999", weight: 2};
	var contour_style_fm_23 = {color: "#00a", opacity: 1.0,  fillOpacity: 0, fillColor: "#00a", weight: 2};
	var contour_style_fm_non = {color: "#000", opacity: 1.0,  fillOpacity: 0, fillColor: "#000", weight: 2};
	
	var contour_style_am_station = {color: "#ffa500", opacity: 1.0,  fillOpacity: 0.0, fillColor: "#00aa00", weight: 2};
	
	function createMap() {
 
     L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
     map = L.mapbox.map('map', 'fcc.k74ed5ge', {
             attributionControl: true,
             maxZoom: 19,
			 minZoom: 3
         })
         .setView([40, -97], 3);
		 
	 baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge').addTo(map);
     baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
     baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');
		 
	 L.control.scale({
         position: 'bottomleft'
     }).addTo(map);

     geocoder = L.mapbox.geocoder('mapbox.places-v1');

     layerControl = new L.Control.Layers({
         'Street': baseStreet.addTo(map),
         'Satellite': baseSatellite,
         'Terrain': baseTerrain
     }, {
     }, {
		position: 'topleft'
	 }
	 ).addTo(map);

	  
	 map.on("click", function(e) {
		clickedMap(e);
	});
	  
	}
	
function clickedMap(e) {
	clickX = cursorX;
	clickY = cursorY;
	var lat = Math.round(1000000*e.latlng.lat)/1000000.0;
	var lon = Math.round(1000000*e.latlng.lng)/1000000.0;
	
	if (map.hasLayer(translatorMarker_tmp)) {
		map.removeLayer(translatorMarker_tmp);
	}
	translatorMarker_tmp = L.marker([lat, lon]).addTo(map);
	
	if (map.hasLayer(interferingContours_layer)) {
		var translatorLat_dms = getDMS(lat, "lat");
		var translatorLon_dms = getDMS(lon, "lon");
		var alert_text = "This will set translator at:<br>Lat: " + lat + " (" + translatorLat_dms + ")<br>Lon: " + lon + " (" + translatorLon_dms + ")";
		$('#translator-alert-text').html(alert_text);
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:140,
		  width: 300,
		  modal: true,
		  buttons: {
			"Yes": function() {
				$( this ).dialog( "close" );

				//remove tmp marker
				if (map.hasLayer(translatorMarker_tmp)) {
					map.removeLayer(translatorMarker_tmp);
				}
				//add perm marker
				if (map.hasLayer(translatorMarker)) {
					map.removeLayer(translatorMarker);
				}
				translatorMarker = L.marker([lat, lon]).addTo(map);
		
				translatorLat = lat;
				translatorLon = lon;
		
				amrProcess(lat, lon);
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
				//remove tmp marker
				if (map.hasLayer(translatorMarker_tmp)) {
					map.removeLayer(translatorMarker_tmp);
				}
			}
		  }
		});
	}
	else {
		amrProcess(lat, lon);
	}
	
	
	
}
	
function process_rows(rows) {
var arr1 = [];
for (var i = 0; i < rows.length; i++) {
arr1.push(rows[i].channel + "," + rows[i].callsign + "," + rows[i].filenumber + "," + rows[i].facility_id + "," + rows[i].service +  "," + rows[i].class + "," + rows[i].station_lat + "," + rows[i].station_lon + "," + rows[i].uuid +  "," + rows[i].area + "," + rows[i].area1);
}

arr1.sort();
arr2 = [];
var items, entry;
for (i=0; i < arr1.length; i++) {
items = arr1[i].split(",");
items[9] = Math.round(items[6]*10)/10;
items[10] = Math.round(items[7]*10)/10;
entry = {"channel": items[0], "callsign": items[1], "filenumber": items[2], "facility_id": items[3], "service": items[4], "class": items[5], "station_lat": items[6], "station_lon": items[7], "uuid": items[8], "area": items[9], "area1": items[10]};
arr2.push(entry);
}

return arr2;
}

function makeText(data, interferenceType) {
var str1 = "<table cellpadding=1><tr><td>Channel</td><td>Call</td><td>Service</td><td>fac ID</td><td>Class</td><td>Overlap</td><td>Contour Area</td><td></td></tr>\n";
for (var i = 0; i < data.length; i++) {
str1 += "<tr><td>" + data[i].channel + "</td><td>" + data[i].callsign + "</td><td>" + data[i].service + "</td><td>" + data[i].facility_id + "</td><td>" + data[i].class + "</td><td>" + data[i].area + "</td><td>" + data[i].area1 + "</td><td><span class=\"click-facility_id-class\" value=\"" + data[i].callsign + "," + data[i].class + "\" style=\"cursor: pointer; color: #aaaaff\" >Show Contour(" + data[i].facility_id + "," + data[i].class + "," + interferenceType + ")</span></td></tr>\n";
}
str1 += "</table>";

return str1;
}

function getChannels(data) {
var arr1 = [];
for (var i = 0; i < data.length; i++) {
arr1.push(parseInt(data[i].channel));
}

arr1.sort();

return arr1;
}

function contains(arr, a) {
for (var i = 0; i < arr.length; i++) {
if (a == arr[i]) {return true;}
}
return false;
}

function clearAll() {
	if (map.hasLayer(interferingContours_layer)) {
		map.removeLayer(interferingContours_layer);
	}
	if (map.hasLayer(fmContours_layer)) {
		map.removeLayer(fmContours_layer);
	}
	//if (map.hasLayer(amStation_layer)) {
		//map.removeLayer(amStation_layer);
	//}
	$('#tabs-1').html("Available channels list");
	$('#tabs-2').html("Details for each channel");
	$('#info_panel').css({"visibility": "hidden"}).html('Info Area');
}


function processData(data) {

clearAll();

var lat = data.location.latlng.lat;
var lon = data.location.latlng.lng;
var insideUs = data.location.isInsideUs;

if (!insideUs) {
var text = "ERROR: This location (" + lat + ", " + lon + ") is outside of US"
$('#info_panel').css({"visibility": "visible"}).html(text);
alert(text);
return;
}


amProcessDataNow = data;
var uuid = data.uuid;
uuid4InterferringContour = uuid;

getInterferingContours(uuid);

var data_co_usa = process_rows(data.data_co_usa);
var data_1_usa = process_rows(data.data_1_usa);
var data_23_usa = process_rows(data.data_23_usa);
var data_co_mex = process_rows(data.data_co_mex);
var data_1_mex = process_rows(data.data_1_mex);
var data_23_mex = process_rows(data.data_23_mex);
var intersectsCanada = data.intersectsCanada;
var intersectsMexico = data.intersectsMexico;
var intersectsCaribbean = data.intersectsCaribbean;

var available_co_1 = [];
for (var i = 0; i <301; i++) {
if (i < 221) {
available_co_1.push(0);
}
else {
available_co_1.push(1);
}
}

channelInfo = {}
for (var c = 221; c < 301; c++) {
fm_info_co_usa = getFMInfo_co(c, data_co_usa);
fm_info_1_usa = getFMInfo_1(c, data_1_usa);
fm_info_23_usa = getFMInfo_23(c, data_23_usa);
fm_info_co_mex = getFMInfo_co(c, data_co_mex);
fm_info_1_mex = getFMInfo_1(c, data_1_mex);
fm_info_23_mex = getFMInfo_23(c, data_23_mex);

channelInfo[c] = {"fm_info_co_usa": fm_info_co_usa, "fm_info_1_usa": fm_info_1_usa, "fm_info_23_usa": fm_info_23_usa,
					"fm_info_co_mex": fm_info_co_mex, "fm_info_1_mex": fm_info_1_mex, "fm_info_23_mex": fm_info_23_mex
					};


}

console.log(channelInfo);

//make channel list
var channel_text = "<table class=\"channel-list-table\"><tr><td style=\"width: 19%\">Ch</td><td style=\"width: 27%\">Co</td><td style=\"width: 27%\">First</td><td style=\"width: 27%\">2/3</td></tr>";
for (c = 221; c < 301; c++) {

//co usa
text_co = "";
for (var i = 0; i < channelInfo[c].fm_info_co_usa.length; i++) {
var facility_id = channelInfo[c].fm_info_co_usa[i].facility_id;
var uuid = channelInfo[c].fm_info_co_usa[i].uuid;
var id = c + ":" + uuid;
text_co += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "</span>, ";
}

//co mex
for (var i = 0; i < channelInfo[c].fm_info_co_mex.length; i++) {
var facility_id = channelInfo[c].fm_info_co_mex[i].facility_id;
if (facility_id == -2) {
	facility_id = "N/A";
}
var uuid = channelInfo[c].fm_info_co_mex[i].uuid;
var id = c + ":" + uuid;
text_co += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "(m)</span>, ";
}
text_co = text_co.replace(/, $/, "");

//1st usa
text_1 = "";
for (var i = 0; i < channelInfo[c].fm_info_1_usa.length; i++) {
var facility_id = channelInfo[c].fm_info_1_usa[i].facility_id;
var uuid = channelInfo[c].fm_info_1_usa[i].uuid;
var id = c + ":" + uuid;
text_1 += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "</span>, ";
}

//1st mex
for (var i = 0; i < channelInfo[c].fm_info_1_mex.length; i++) {
var facility_id = channelInfo[c].fm_info_1_mex[i].facility_id;
if (facility_id == -2) {
	facility_id = "N/A";
}
var uuid = channelInfo[c].fm_info_1_mex[i].uuid;
var id = c + ":" + uuid;
text_1 += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "(m)</span>, ";
}
text_1 = text_1.replace(/, $/, "");

//2nd/3rd usa
text_23 = "";
for (var i = 0; i < channelInfo[c].fm_info_23_usa.length; i++) {
var facility_id = channelInfo[c].fm_info_23_usa[i].facility_id;
var uuid = channelInfo[c].fm_info_23_usa[i].uuid;
var id = c + ":" + uuid;
text_23 += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "</span>, ";
}

//2nd/3rd mex
for (var i = 0; i < channelInfo[c].fm_info_23_mex.length; i++) {
var facility_id = channelInfo[c].fm_info_23_mex[i].facility_id;
if (facility_id == -2) {
	facility_id = "N/A";
}
var uuid = channelInfo[c].fm_info_23_mex[i].uuid;
var id = c + ":" + uuid;
text_23 += "<span id=\"" + id + "\" class=\"channel-list-span\">" + facility_id + "(m)</span>, ";
}
text_23 = text_23.replace(/, $/, "");

var num_all = channelInfo[c].fm_info_co_usa.length +
				channelInfo[c].fm_info_1_usa.length +
				channelInfo[c].fm_info_23_usa.length +
				channelInfo[c].fm_info_co_mex.length +
				channelInfo[c].fm_info_1_mex.length +
				channelInfo[c].fm_info_23_mex.length;
				



if (num_all == "") {
	channel_class = "available";
}
else if (num_all == channelInfo[c].fm_info_23_usa.length){
	channel_class = "available-with-waiver";
}
else {
	channel_class = "unavailable";
}

channel_text += "<tr id=\"row-" + c + "\"><td><span class=\"" + channel_class + " details\">" + c + "</span></td><td>" + text_co + "</td><td>" + text_1 + "</td><td>" + text_23 + "</td></tr>";

}

channel_text += "</table>";

console.log(channel_text);
$("#tabs-2").html(channel_text);


$('.channel-list-span').on('click', function(e) {
clickFM(e);
});

$('.details').on('click', function(e) {
clickAvailableChannel(e);
});

//country language
var country_text = "";
if (intersectsCanada) {
	country_text = "The proposed site is close to the US/Canadian common border and the proposed \
	translator will require Canadian concurrence.  Compliance with the US/Canadian agreement may \
	further limit the channels available at this location.";
}
if (intersectsMexico) {
	country_text = "The proposed site is within 130 km of the US/Mexican common border and will require Mexican concurrence.";
}
if (intersectsCaribbean) {
	country_text = "The proposed site is in Puerto Rico or the Virgin Islands and will require notification to the \
	International Telecommunication Union.  Compliance with this process may further limit the channels available at this location.";
}

var availableChannelListAll = [];
var availableChannelListWaiver = [];
var channelAvailable = [];
var channelAvailableWithWaiver = [];
var channelUnavailable = [];
var index;
for (index = 221; index < 301; index++) {
	var sum_all = channelInfo[index].fm_info_co_usa.length + 
				channelInfo[index].fm_info_co_mex.length + 
				channelInfo[index].fm_info_1_usa.length + 
				channelInfo[index].fm_info_1_mex.length + 
				channelInfo[index].fm_info_23_usa.length + 
				channelInfo[index].fm_info_23_mex.length;

	if (sum_all == 0) {
		channelAvailable.push(index);
	}
	else if (sum_all == channelInfo[index].fm_info_23_usa.length) {
		channelAvailableWithWaiver.push(index);
	}
	else {
		channelUnavailable.push(index);
	}
}
				

var channelAvailabilityTable = makeAvailableTable(channelInfo);

//legend:
var legend_text = "<table class=\"legend-table\" width=100% cellspacing=20><caption>Legend</caption>";
legend_text += "<tr><td><div class=\"available-legend\">000</div></td><td>Available (total: " + channelAvailable.length + ")</td></tr>";
legend_text += "<tr><td><div class=\"available-with-waiver-legend\">000</div></td><td>Available with Waiver (" + channelAvailableWithWaiver.length + ")</td></tr>";
legend_text += "<tr><td><div class=\"unavailable-legend\">000</div></td><td>Unavailable (" + channelUnavailable.length + ")</td></tr>";

legend_text += "</table>";

var translatorLat_dms = getDMS(translatorLat, "lat");
var translatorLon_dms = getDMS(translatorLon, "lon");

var location_text = "<span id=\"location-title\">Translator Location:</span><br>" +
					"<b>Lat:</b> " + translatorLat + " (" + translatorLat_dms + ")<br>" +
					"<b>Lon:</b> " + translatorLon + " (" + translatorLon_dms + ")";

var country_language = "";
if (country_text != "") {
country_language = "<p><span class=\"country-language\">" + country_text + "</span><p>";

}
					
var text = "<span class=\"location-text\">" + location_text + "</span><p><p>";
text += country_language;				
text += channelAvailabilityTable + legend_text;

$("#tabs-1").html(text);
//switch to summary tab
$( "#tabs" ).tabs({active: 0});
console.log(text);
$('.summary').on("click", function(e) {
clickedOnSummaryTable(e);
});

}


function clickedOnSummaryTable(e) {
var channel = $(e.target).html();
channelClicked = channel;

//switch to details tab
$( "#tabs" ).tabs({active: 1});

//scroll
var container = $('#tabs-2'),
scrollTo = $('#row-' + channel);
container.scrollTop(scrollTo.offset().top - container.offset().top + container.scrollTop() - 200);

//show all FM contours on map
showAllFMContours(channel);

}


function highlightRowInDeatilsTable(channel) {
for (var i = 221; i < 301; i++) {
var id = "row-" + i;
if (i == channel) {
$('#' + id).css({"border": "solid 2px #000"});
}
else {
$('#' + id).css({"border": "solid 0px #000"});
}
}
}

function highlightCellInSummaryTable(channel) {
for (var i = 221; i < 301; i++) {
var id = "cell-" + i;
if (i == channel) {
$('#' + id).css({"border": "solid 2px #000"});
}
else {
$('#' + id).css({"border": "solid 0px #000"});
}
}
}

function getDMS(a, latlon) {
var a0 = Math.abs(a);
var deg = Math.floor(a0);
var min = Math.floor((a0 - deg) * 60);
var sec = (a0 - deg -min/60.0) * 3600;
sec = Math.round(sec*10)/10;
var dir;
if (latlon == "lat") {
	if (a >= 0) {
		dir = "N";
	}
	else {
		dir = "S";
	}
}
if (latlon == "lon") {
	if (a >= 0) {
		dir = "E";
	}
	else {
		dir = "W";
	}
}

var dms = deg + "&deg;" + " " + min + "&#39;" + " " + sec + "&#34; " + dir;

return dms;

}




function getFMInfo_co(c, data_co) {
	fm_info = [];
	for (var i = 0; i < data_co.length; i++) {
		if (data_co[i].channel == c) {
			fm_info.push(data_co[i])
		}
	}
	return fm_info;
}

function getFMInfo_1(c, data_1) {
	fm_info = [];
	for (var i = 0; i < data_1.length; i++) {
		var dif = Math.abs(c - data_1[i].channel);
		if (dif == 1) {
			fm_info.push(data_1[i])
		}
	}
	return fm_info;
}

function getFMInfo_23(c, data_23) {
	fm_info = [];
	for (var i = 0; i < data_23.length; i++) {
		var dif = Math.abs(c - data_23[i].channel);
		if (dif == 2 || dif == 3) {
			fm_info.push(data_23[i])
		}
	}
	return fm_info;
}

function clickFM(e) {
e.preventDefault();
var id = e.target.id;
var channel_impacted = id.split(":")[0];
var uuid = id.split(":")[1];

var url = "fmContours/" + uuid;

	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
	
			fmContoursNow = data;
			
			if (map.hasLayer(fmContours_layer)) {
				map.removeLayer(fmContours_layer);
			}
			
			fmContours_layer = L.geoJson(data, {
				style: contour_style_fm
			}).addTo(map);
			
			map.fitBounds(fmContours_layer.getBounds());
			
			//make FM contours clickable
			fmContours_layer.on("click", function(e) {
				clickedMap(e);
			});
			
			//re-plot interfering contours
			
			var class0 = data.features[0].properties.class;
			var facility_id = data.features[0].properties.facility_id;
			var filenumber = data.features[0].properties.filenumber;
			var channel = fmContoursNow.features[0].properties.channel;
			var country = fmContoursNow.features[0].properties.country;
			var callsign = fmContoursNow.features[0].properties.callsign;
			var service = fmContoursNow.features[0].properties.service;
			var station_lat = fmContoursNow.features[0].properties.station_lat;
			var station_lon = fmContoursNow.features[0].properties.station_lon;
			
			var type_str = "";
			var interferenceType = "";
			var dif = Math.abs(channel - channel_impacted);
			if (dif == 0) {
				interferenceType = "co";
				type_str = "co-channel";
			}
			else if (dif == 1) {
				interferenceType = "1";
				type_str = "1st adjacent-channel";
			}
			else if (dif == 2) {
				interferenceType = "23";
				type_str = "2nd adjacent-channel";
			}
			else if (dif == 3) {
				interferenceType = "23";
				type_str = "3rd adjacent-channel";
			}
			
			if (class0 == 'B') {
				if (interferenceType == "co") {
					dbus = [34];
				}
				else if (interferenceType == "1") {
					dbus = [48];
				}
				else if (interferenceType == "23") {
					dbus = [94];
				}
			}
			else if (class0 == 'B1') {
				if (interferenceType == "co") {
					dbus = [37];
				}
				else if (interferenceType == "1") {
					dbus = [51];
				}
				else if (interferenceType == "23") {
					dbus = [97];
				}
			}
			else if (contains(['A', 'C', 'C0', 'C1', 'C2', 'C3', 'D', 'L1', 'AA'], class0)) {
				if (interferenceType == "co") {
					dbus = [40];
				}
				else if (interferenceType == "1") {
					dbus = [54];
				}
				else if (interferenceType == "23") {
					dbus = [100];
				}
			}
				
			var features = [];
			for (var i = inerferingContoursNow.features.length-1; i >= 0; i--) {
				if (contains(dbus, inerferingContoursNow.features[i].properties.dbu)) {
					features.push(inerferingContoursNow.features[i]);
				}
			}
			var interference_geojson = {"type": "FeatureCollection", "features": features};
			
			if (map.hasLayer(interferingContours_layer)) {
				map.removeLayer(interferingContours_layer);
			}
			interferingContours_layer = L.geoJson(interference_geojson, {
				style: contour_style,
				onEachFeature: onEachFeature_interfering_contour
			}).addTo(map);
			
			//map.fitBounds(interferingContours_layer.getBounds());
			
			//make interfering contours clickable
			interferingContours_layer.on("click", function(e) {
				clickedMap(e);
			});
			
			var info_text = "Channel " + channel_impacted + " is not available because of <b>" + type_str + "</b> interference with the following FM station:<br>";
			info_text += "<table border=1 cellspacing=0><tr><td>Facility ID</td><td>Call Sign</td><td>File Number</td><td>Service</td><td>Class</td><td>Channel</td><td>Country</td><td>Station Lat</td><td>Station Lon</td></tr>";
			info_text += "<tr><td>" + facility_id + "</td><td>" + callsign + "</td><td>" + filenumber + "</td><td>" + service + "</td><td>" + class0 + "</td><td>" + channel + "</td><td>" + country + "</td><td>" + station_lat + "</td><td>" + station_lon + "</td></tr></table>";
			
			
			$('#info_panel').css({"visibility": "visible"}).html(info_text);
			
			console.log(info_text);
		

		}
			
			
			
			

	});


}


function clickAvailableChannel(e) {
var channel = $(e.target).html();
channelClicked = channel;
showAllFMContours(channel);
}

function showAllFMContours(channel) {
//highlight row in details table
highlightRowInDeatilsTable(channel);
highlightCellInSummaryTable(channel);

showLoader("center");

var url = "fmForAvailableChannel/" + channel + "/" + uuid4InterferringContour;

console.log(url)
	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
		
			allFMContoursNow = data;
			
			//determine interfernce type of each contour
			for (var i = 0; i < allFMContoursNow.features.length; i++) {
				var interType = getInterferenceType(channelClicked, allFMContoursNow.features[i].properties.uuid);
				allFMContoursNow.features[i].properties.interferenceType = interType;
				console.log(i + ' ' + allFMContoursNow.features[i].properties.interferenceType);
			}
			
			
			if (data.features.length > 0) {
				if (map.hasLayer(fmContours_layer)) {
					map.removeLayer(fmContours_layer);
				}
				
				fmContours_layer = L.geoJson(data, {
					style: getStyleFM,
					onEachFeature: onEachFeature_nearbyFM
				}).addTo(map);
				//make fm contours clickable
				fmContours_layer.on("click", function(e) {
					clickedMap(e);
				});
				
				var text = "Channel " + channel + ": Nearby FM stations with &#177;3 channel #<p>";
				$('#info_panel').css({"visibility": "visible"}).html(text);
				
				//draw interfering contours	
				if (map.hasLayer(interferingContours_layer)) {
					map.removeLayer(interferingContours_layer);
				}

				interferingContours_layer = L.geoJson(inerferingContoursNow, {
					style: contour_style,
					onEachFeature: onEachFeature_interfering_contour
				}).addTo(map);
				
				//make interfering contours clickable
				interferingContours_layer.on("click", function(e) {
					clickedMap(e);
				});
				
				//zoom to FM contour bounds
				map.fitBounds(fmContours_layer.getBounds());
				
				//hide Loader
				hideLoader();
			
			}
			else {
				hideLoader();
				alert("No FM stations within 50km of 34 dBu contours");
			}

			
		}
	});
}

function getStyleFM(feature) {
	if (feature.properties.interferenceType == "co" || feature.properties.interferenceType == "1") {
		return contour_style_fm_co_1;
	}
	else if (feature.properties.interferenceType == "2" || feature.properties.interferenceType == "3") {
		return contour_style_fm_23;
	}
	else {
		return contour_style_fm_non;
	}
}

function getInterferenceType(c, uuid) {

var info = channelInfo[c];

var type = "";
//co
for (var i = 0; i < info.fm_info_co_usa.length; i++) {
	if (info.fm_info_co_usa[i].uuid == uuid) {
		type = "co";
	}
}
for (var i = 0; i < info.fm_info_co_mex.length; i++) {
	if (info.fm_info_co_mex[i].uuid == uuid) {
		type = "co";
	}
}
//1st
for (var i = 0; i < info.fm_info_1_usa.length; i++) {
	if (info.fm_info_1_usa[i].uuid == uuid) {
		type = "1";
	}
}
for (var i = 0; i < info.fm_info_co_mex.length; i++) {
	if (info.fm_info_co_mex[i].uuid == uuid) {
		type = "1";
	}
}
for (var i = 0; i < info.fm_info_23_usa.length; i++) {
	if (info.fm_info_23_usa[i].uuid == uuid) {
		type = Math.abs(info.fm_info_23_usa[i].channel - c) + '';		
	}
}
for (var i = 0; i < info.fm_info_23_mex.length; i++) {
	if (info.fm_info_23_mex[i].uuid == uuid) {
		type = Math.abs(info.fm_info_23_mex[i].channel - c) + '';	
	}
}

if (type == "") {
	type = "non";
}

return type;

}

function onEachFeature_nearbyFM(feature, layer) {
    layer.on({
        mouseover: overNearbyFM,
        mouseout: outNearbyFM
    });
}

function overNearbyFM(feature, layer) {
	var p = feature.target.feature.properties;
	var inteerType;
	if (p.interferenceType == "co") {
		interType = "co-channel";
	}
	else if (p.interferenceType == "1") {
		interType = "1st-adjacent";
	}
	else if (p.interferenceType == "2") {
		interType = "2nd-adjacent";
	}
	else if (p.interferenceType == "3") {
		interType = "3rd-adjacent";
	}
	else {
		interType = "None";
	}
	
	var text = "Channel " + channelClicked + ": Nearby FM stations with &#177;3 channel #<p>";
	text += "Mouseover Station Info:"
	text += "<table border=1 cellspacing=0><tr><td>Facility ID</td><td>Call Sign</td><td>File Number</td><td>Service</td><td>Class</td><td>Channel</td><td>Country</td><td>Station Lat</td><td>Station Lon</td><td>Interference Type</td></tr>";
	text += "<tr><td>" + p.facility_id + "</td><td>" + p.callsign + "</td><td>" + p.filenumber + "</td><td>" + p.service + "</td><td>" + p.class + "</td><td>" + p.channel + "</td><td>" + p.country + "</td><td>" + p.station_lat + "</td><td>" + p.station_lon + "</td><td>" + interType + "</td></tr></table>";
			
	
	$('#info_panel').css({"visibility": "visible"}).html(text);
	//highlight interfering contours
	var dif = Math.abs(channelClicked - p.channel);
	var class0 = p.class;
	var dbu = 0;
	if (class0 == 'B') {
		if (dif == 0) {
			dbu = 34;
		}
		else if (dif == 1) {
			dbu = 48;
		}
		else if (dif >= 2) {
			dbu = 94;
		}
	
	}
	else if (class0 == 'B1') {
		if (dif == 0) {
			dbu = 37;
		}
		else if (dif == 1) {
			dbu = 51;
		}
		else if (dif >= 2) {
			dbu = 97;
		}
	
	}
	else {
		if (dif == 0) {
			dbu = 40;
		}
		else if (dif == 1) {
			dbu = 54;
		}
		else if (dif >= 2) {
			dbu = 100;
		}
	
	}
	
	var features = [];
	for (var i = inerferingContoursNow.features.length-1; i >= 0; i--) {
		if (inerferingContoursNow.features[i].properties.dbu == dbu) {
			features.push(inerferingContoursNow.features[i]);
		}
	}
	var interference_geojson = {"type": "FeatureCollection", "features": features};
	
	if (map.hasLayer(interferingContoursHighlight_layer)) {
		map.removeLayer(interferingContoursHighlight_layer);
	}
	interferingContoursHighlight_layer = L.geoJson(interference_geojson, {
		style: contour_style_highlight
	}).addTo(map);

	//FM contour highlight
	var features =[];
	for (var i = 0; i < allFMContoursNow.features.length; i++) {
		if (allFMContoursNow.features[i].properties.uuid == p.uuid) {
			features.push(allFMContoursNow.features[i]);
		}
	}
	console.log('features=');
	console.log(features);
	var fm_geojson = {"type": "FeatureCollection", "features": features};
	if (map.hasLayer(fmContoursHighlight_layer)) {
		map.removeLayer(fmContoursHighlight_layer);
	}
	fmContoursHighlight_layer = L.geoJson(fm_geojson, {
		style: contour_style_highlight_fm
	}).addTo(map).bringToBack();

console.log(text);
}

function outNearbyFM(feature, layer) {

	var text = "Channel " + channelClicked + ": Nearby FM stations with &#177;3 channel #<p>";
	$('#info_panel').css({"visibility": "visible"}).html(text);
	if (map.hasLayer(interferingContoursHighlight_layer)) {
		map.removeLayer(interferingContoursHighlight_layer);
	}
	if (map.hasLayer(fmContoursHighlight_layer)) {
		map.removeLayer(fmContoursHighlight_layer);
	}
	
	
}

function onEachFeature_interfering_contour(feature, layer) {
    layer.on({
        mouseover: overInterfering,
        mouseout: outInterfering,
		mousemove: moveInterfering
    });
}

function overInterfering(feature, layer) {
console.log('over');
var dbu = feature.target.feature.properties.dbu;
var text = dbu + "dBu";
$('#cursor-tip').html(text);
$('#cursor-tip').css({"top": cursorY-20, "left": cursorX-10});
}

function outInterfering(feature, layer) {
$('#cursor-tip').html("");
}

function moveInterfering(feature, layer) {
$('#cursor-tip').css({"top": cursorY-20, "left": cursorX-10});
}



function makeAvailableTable(channelInfo) {

var text = "<table class=\"available-table\" width=100%><caption>Channel Availability</caption>";
var index;
var class0;

for (var row = 0; row < 10; row++) {
text += "<tr>";
for (var col=0; col<8; col++) {
index = row*8 + col + 221;

var sum_all = channelInfo[index].fm_info_co_usa.length + 
				channelInfo[index].fm_info_co_mex.length + 
				channelInfo[index].fm_info_1_usa.length + 
				channelInfo[index].fm_info_1_mex.length + 
				channelInfo[index].fm_info_23_usa.length + 
				channelInfo[index].fm_info_23_mex.length;

var sum_waiver = channelInfo[index].fm_info_co_usa.length + 
				channelInfo[index].fm_info_co_mex.length + 
				channelInfo[index].fm_info_1_usa.length + 
				channelInfo[index].fm_info_1_mex.length +  
				channelInfo[index].fm_info_23_mex.length;


if (sum_all == 0) {
class0 = "available";
}
else if (sum_all == channelInfo[index].fm_info_23_usa.length) {
class0 = "available-with-waiver";

}
else {
class0 = "unavailable";
}	

text += "<td id=\"cell-" + index + "\" align=center><span class=\"" + class0 + " summary\">" + index + "</span></td>"
}
text += "</tr>";
}
text += "</table>";

return text;
}




	
function getInterferingContours(uuid) {

var url = "interferingContours/" + uuid;

	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
		
		if (data.features.length == 0) {
			alert("No contours available");
			return;
		}
		
		inerferingContoursNow = data;
		
		if (map.hasLayer(interferingContours_layer)) {
			map.removeLayer(interferingContours_layer);
		}
				
		if (map.hasLayer(fmContours_layer)) {
			map.removeLayer(fmContours_layer);
		}
		
		interferingContours_layer = L.geoJson(data, {
			style: contour_style,
			onEachFeature: onEachFeature_interfering_contour
		}).addTo(map);
		
		map.fitBounds(interferingContours_layer.getBounds());
		
		//make interfering contours clickable
		interferingContours_layer.on("click", function(e) {
			clickedMap(e);
		});

		}
		
	});

	
	
	
}
	
function amrProcess(lat, lon) {

	translatorLat = lat;
	translatorLon = lon;
	
	if (clickX != 0 && clickY != 0) {
		showLoader("clicked");
	}
	else {
		showLoader("center");
	}
	
	var url = "amrProcess/" + lat + "/" + lon;

	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
			processData(data);
			hideLoader();
			//add marker
			if (map.hasLayer(translatorMarker)) {
				map.removeLayer(translatorMarker);
			}
			translatorMarker = L.marker([lat, lon]).addTo(map);
	
		}
	});
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

clickX = 0;
clickY = 0;

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

translatorLat = lat;
translatorLon = lon;

amrProcess(lat, lon);
}
	

function search_decimal() {

clickX = 0;
clickY = 0;

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

translatorLat = lat;
translatorLon = lon;

amrProcess(lat, lon);
} 
	
function locChange() {
	var loc = $("#input-location").val();
	geocoder.query(loc, codeMap);
	
	function codeMap(err, data) {
console.log(data);
	if (data.results.features.length == 0) {
		alert("No results found");
		return;
	}
	var lat = data.latlng[0];
	var lon = data.latlng[1];

	amrProcess(lat, lon);

 }
}


function searchLocation() {
locChange();

}


function searchCallsign() {
var callsign = $('#input-callsign').val().toUpperCase();

if (callsign == "") {
alert("No call sign");
return;
}

var url ="amContour/" + callsign;

	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
			if (data.features.length > 0) {
				if (map.hasLayer(amStation_layer)) {
					map.removeLayer(amStation_layer);
				}
			
				amStation_layer =  L.geoJson(data, {
				style: contour_style_am_station,
				onEachFeature: onEachFeature_am
				}).addTo(map);
				map.fitBounds(amStation_layer.getBounds());
				amStation_layer.on("click", function(e) {
					clickedMap(e);
				});
				var lat = data.features[0].properties.station_lat;
				var lon = data.features[0].properties.station_lon;
				amrProcess(lat, lon);
			}
			else {
				alert("No data found for this call sign (" + callsign + ")");
			}
		}
	});
}

function onEachFeature_am(feature, layer) {
    layer.on({
        mouseover: overAM,
        mouseout: outAM,
		mousemove: moveAM
    });
}

function overAM(feature, layer) {
var p = feature.target.feature.properties;
var callsign = p.callsign;
var facility_id = p.facility_id;
var class0 = p.class;
var level = p.contour_level;
var text = callsign + '|' + facility_id + '|' + class0 + '|' + level + 'mv/m';
console.log(text);

$('#cursor-tip').html(text);
$('#cursor-tip').css({"top": cursorY-20, "left": cursorX-10});
}

function outAM(feature, layer) {
$('#cursor-tip').html("");
$('#cursor-tip').css({"top": cursorY-20, "left": cursorX-10});
}


function moveAM(feature, layer) {
$('#cursor-tip').css({"top": cursorY-20, "left": cursorX-10});
}


function getAllAMCallsignList() {

var url = "allAMCallsignList";

$.ajax(url, {
	type: "GET",
	url: url,
	dataType: "json",
	success: function(data){
	
		allAMCallsignList = data;

	}
	});
}


function getCallsignList(callsign, count) {

var callsign_list = [];
var i;
var num = 0;
//starting first letter
for (i =0; i < allAMCallsignList.length; i++) {
var pat = "^" + callsign + ".*";
var regex = new RegExp( pat, 'g' );
if (allAMCallsignList[i].match(regex)) {
	callsign_list.push(allAMCallsignList[i]);
	num += 1;
	if (num == count) {
		break;
	}
}
}

if (callsign_list.length < count) {
//starting second letter
for (i =0; i < allAMCallsignList.length; i++) {
var pat = "^." + callsign + ".*";
var regex = new RegExp( pat, 'g' );
if (allAMCallsignList[i].match(regex)) {
	callsign_list.push(allAMCallsignList[i]);
	num += 1;
	if (num == count) {
		break;
	}
}
}
}


if (callsign_list.length < count) {
//starting third letter
for (i =0; i < allAMCallsignList.length; i++) {
var pat = "^.." + callsign + ".*";
var regex = new RegExp( pat, 'g' );
if (allAMCallsignList[i].match(regex)) {
	callsign_list.push(allAMCallsignList[i]);
	num += 1;
	if (num == count) {
		break;
	}
}
}
}

console.log(callsign_list);

return callsign_list;

}

	
function setupListener() {

$(function() {
	$( "#tabs" ).tabs();
	$( "#tabs" ).tabs({ active: 0 });
});

 $('.btn-legend').click(function(){ 
	$(this).hide();
	$('.legend').show('fast');
});

$("#latlon-btn").on("click", function(e) {
e.preventDefault();

var lat = $('#lat').val();
var lon = $('#lon').val();

if (lat == "" || lon == "") {
alert("Please enter lat/lon");
return;
}

amrProcess(lat, lon);
});


$("#am-callsign-btn").on("click", function(e) {
e.preventDefault();

var callsign = $('#am-callsign').val().toUpperCase();

if (callsign == "") {
alert("Please call sign");
return;
}

var url = "amContour/" + callsign;

	$.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data){
			if (data.features.length > 0) {
				if (map.hasLayer(amStation_layer)) {
					map.removeLayer(amStation_layer);
				}
			
				amStation_layer =  L.geoJson(data, {
				style: contour_style_am_station
				}).addTo(map);
				map.fitBounds(amStation_layer.getBounds());
				amStation_layer.on("click", function(e) {
					clickedMap(e);
				});
			}
		}
	});

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
	 
	 $("#input-callsign-search").on("click", function(e) {
         e.preventDefault();
         searchCallsign();
     });


	$("#input-search-switch").on('click', 'a', function(e) {
		var search = $(e.currentTarget).data('value');
		
		e.preventDefault();	

        $("#input-location").val('');
		$("#input-callsign").val('');

		if (search == 'loc') {
			$("#input-latlon-dms").css('display', 'none');
			$("#span-latlon-dms-search").css('display', 'none');
			$("#input-latlon-decimal").css('display', 'none');
			$("#span-latlon-decimal-search").css('display', 'none');
			$("#input-callsign").css('display', 'none');
			$("#span-callsign-search").css('display', 'none');
			
			$("#input-location").css('display', 'block');
			$("#span-location-search").css('display', 'table-cell');
			$("#btn-label").text('Address');
        }
		
        else if (search == 'latlon-dms') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-latlon-decimal").css('display', 'none');
			$("#span-latlon-decimal-search").css('display', 'none');
			$("#input-callsign").css('display', 'none');
			$("#span-callsign-search").css('display', 'none');
			
            $("#input-latlon-dms").css('display', 'block');
            $("#span-latlon-dms-search").css('display', 'table-cell');
			$("#btn-label").text('Lat/lon (DMS)');
        }
		
		
        else if (search == 'latlon-decimal') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-latlon-dms").css('display', 'none');
			$("#span-latlon-dms-search").css('display', 'none');
			$("#input-callsign").css('display', 'none');
			$("#span-callsign-search").css('display', 'none');
			
            $("#input-latlon-decimal").css('display', 'block');
            $("#span-latlon-decimal-search").css('display', 'table-cell');
			$("#btn-label").text('Lat/Lon (decimal)');
        }
		
		else if (search == 'callsign') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-latlon-dms").css('display', 'none');
			$("#span-latlon-dms-search").css('display', 'none');
			$("#input-latlon-decimal").css('display', 'none');
			$("#span-latlon-decimal-search").css('display', 'none');
			
            $("#input-callsign").css('display', 'block');
            $("#span-callsign-search").css('display', 'table-cell');
			$("#btn-label").text('AM Call Sign');
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
	
	$('#input-callsign').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-callsign-search').click();
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

                 map.setView([geo_lat, geo_lon], 12);
				 translatorLat = geo_lat;
				 translatorLon = geo_lon;
				 amrProcess(geo_lat, geo_lon);

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
		 map.setView([40, -97], 3);
     });
	
	$( "#input-callsign" ).autocomplete({
        source: function( request, response ) {
			var callsign = request.term.toUpperCase();
			var callsign_list = getCallsignList(callsign, 20);
			response(callsign_list);

        },
        minLength: 1,
        select: function( event, ui ) {
            setTimeout(function() {searchCallsign();}, 200);
			//searchCallsign();
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
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
	getAllAMCallsignList();
	
});
