/*
    __________________   __  ___                
   / ____/ ____/ ____/  /  |/  /___ _____  _____
  / /_  / /   / /      / /|_/ / __ `/ __ \/ ___/
 / __/ / /___/ /___   / /  / / /_/ / /_/ (__  ) 
/_/    \____/\____/  /_/  /_/\__,_/ .___/____/  
                                 /_/            
*/


var geo_host = '//www.broadbandmap.gov';
var geo_space = 'gis_swat';
var geo_output = 'application/json'

/*
var geo_host = 'http://ltsttm-geo02a:8080';
var geo_space = 'geo_swat';
var geo_output = 'application/json'
*/


var geo_host = 'http://gisp-geoserv-dock-dev02.elasticbeanstalk.com';
var geo_space = 'gisp';
var geo_output = 'application/json'


console.log(geo_host);

var nn = 0;
var map;
var shownPolyCounty;
var clickedCounty;
var clickedLayer;
var selected_id;
var selected_sac;
var selected_co_name;
var selected_provider;
var allData = {"features" : []};
var providerInfo = {"features" : []};
var providerList = [];
var providerSacLatLon = {}
var latNow;
var lngNow;
var sacData = {};
var sacDataNow = {};
var nowInSAC = "";
var nowInSACLayer = "";
var block_layer;
var providerLayer;
var allPinsLayer;
var downloadWhat = "";
var marker_color_off = "#9999ee";
var marker_color_on = "#ee0000";
var activeTab = "company";


 var countyStyleHidden = {
          weight: 0,
          opacity: 0.0,
          color: 'black',
          fillOpacity: 0.0
      };
	  
 var countyStyleShown = {
	color: '#FFFF00',
    weight: 5,
    opacity: 1.0,
    fillOpacity: 0.0
      };
	  
 var countyStyleSearched = {
	color: '#FFFF00',
	fillColor: '#FFFF00',
    weight: 5,
    opacity: 1.0,
    fillOpacity: 0.0
      };
	  
 var styleShown = {
	color: '#FF0000',
	fillColor: '#0000FF',
    weight: 0,
    opacity: 0.0,
    fillOpacity: 0.0
      };
 var styleClicked = {
	color: '#FF0000',
	fillColor: '#FF0000',
    weight: 3,
    opacity: 1.0,
    fillOpacity: 0.0
      };
	  
 var styleMouseOver = {
	color: '#00FF00',
	fillColor: '#0000FF',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.0
      };
	  
 var blockStyle = {
	color: '#FFFF00',
	fillColor: '#FFFF00',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.25
      };
	  
var state_name = {
"AL": "Alabama",
"AK": "Alaska",
"AZ": "Arizona",
"AR": "Arkansas",
"CA": "California",
"CO": "Colorado",
"CT": "Connecticut",
"DE": "Delaware",
"DC": "District of Columbia",
"FL": "Florida",
"GA": "Georgia",
"HI": "Hawaii",
"ID": "Idaho",
"IL": "Illinois",
"IN": "Indiana",
"IA": "Iowa",
"KS": "Kansas",
"KY": "Kentucky",
"LA": "Louisiana",
"ME": "Maine",
"MD": "Maryland",
"MA": "Massachusetts",
"MI": "Michigan",
"MN": "Minnesota",
"MS": "Mississippi",
"MO": "Missouri",
"MT": "Montana",
"NE": "Nebraska",
"NV": "Nevada",
"NH": "New Hampshire",
"NJ": "New Jersey",
"NM": "New Mexico",
"NY": "New York",
"NC": "North Carolina",
"ND": "North Dakota",
"OH": "Ohio",
"OK": "Oklahoma",
"OR": "Oregon",
"PA": "Pennsylvania",
"RI": "Rhode Island",
"SC": "South Carolina",
"SD": "South Dakota",
"TN": "Tennessee",
"TX": "Texas",
"UT": "Utah",
"VT": "Vermont",
"VA": "Virginia",
"WA": "Washington",
"WV": "West Virginia",
"WI": "Wisconsin",
"WY": "Wyoming",
"AS": "American Samoa",
"GU": "Guam",
"MP": "North Mariana Islands",
"PR": "Puerto Rico",
"VI": "US Virgin Island"
}
	  
 function createMap() {
 
     L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
     map = L.mapbox.map('map', 'fcc.k74ed5ge', {
             attributionControl: true,
             maxZoom: 19
         })
         .setView([45, -93], 3);

     map.attributionControl.addAttribution('<a href="http://fcc.gov/maps">FCC Maps</a>');

     baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge').addTo(map);
     baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
     baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');

    var wms_overbuilt_sabs = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':overbuilt_sabs'
     });

	var wms_overbuilt_blocks = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':overbuilt_blocks'
     });
	 

     L.control.scale({
         position: 'bottomright'
     }).addTo(map);

     geocoder = L.mapbox.geocoder('mapbox.places-v1');

     layerControl = new L.Control.Layers({
         'Street': baseStreet.addTo(map),
         'Satellite': baseSatellite,
         'Terrain': baseTerrain
     }, {
	 	'Overbult Blocks': wms_overbuilt_blocks.addTo(map),
		'Overbuilt Sabs': wms_overbuilt_sabs.addTo(map)

     }, {
		position: 'topleft'
	 }
	 ).addTo(map);
	 

	 
	 
	map.on("zoomend", function(e) {
	
	if (map.getZoom() >= 10) {
	//remove company Pins
	removeAllPinsLayer();
	//remove competitor pin
	if (map.hasLayer(providerLayer)) {
	map.removeLayer(providerLayer);
	}
	}
	else {
	//show pins
	if (activeTab != "competitor") {
	//show company pins
	if (!map.hasLayer(markers[0])) {
	displayAllPins();
	}
	}
	else {
	//show competitor pins
	if (!map.hasLayer(providerLayer)) {
	providerLayer.addTo(map);
	}
	
	
	}
	
	}
	});
	
	//map.on("click", function(e) {
	//mapClickAction(e);
	//});
	
	map.on("mousemove", function(e) {
	latNow = e.latlng.lat;
	lngNow = e.latlng.lng;
	
	//if cursor is in the block, do not show info again
	if (map.hasLayer(block_layer)) {
	var results = leafletPip.pointInLayer([lngNow, latNow], block_layer);
	if (results.length > 0) {
		return;
	}
	}
	
	//if has no SAC layer, or not in SAC layer, stop
	if (map.hasLayer(nowInSACLayer)) {
	var results = leafletPip.pointInLayer([lngNow, latNow], nowInSACLayer);
	if (results.length == 0) {
		return;
	}
	}
	else {
	return;
	}

	var hasData = false;
	for (var key in sacData) {
		if (key == nowInSAC) {
			hasData = true;
		}
	}

	if (!hasData){
		return;
	}
	
	if (nowInSAC != "") {
	var data = sacData[nowInSAC];
	var block_json = {"type": "FeatureCollection"};
	var features = []
	var providers = []
	for (var i = 0; i < data.features.length; i++) {
	var b_layer = L.geoJson(data.features[i]);
	var results = leafletPip.pointInLayer([lngNow, latNow], b_layer);
	if (results.length > 0) {
	features.push(data.features[i]);
	providers.push(data.features[i].properties.provider);
	}
	}
	
	//features = cleanFeatures(features);

	block_json.features = features;
	if (block_json.features.length > 0) {
	var block_fips = block_json.features[0].properties.block_fips;
	//show shape
	if (map.hasLayer(block_layer)) {
	block_layer.off("click");
	map.removeLayer(block_layer);
	}
	block_layer = L.geoJson(block_json, {style: blockStyle});
	block_layer.addTo(map);
	block_layer.on("click", function(e) {
	var sac = nowInSAC;
	selected_sac = sac;
	downloadWhat = "co_name";
	var co_name = getCoNameFromSAC(sac);
	$("#download-co-name").html(co_name + ' [SAC: ' + sac + ']');
	$(".download-menu").show();

	
	
	
	});
	
	}
	//update tooltip
	//Sabs infoText
	//var text = "";

	for (var i = 0; i < allData.features.length; i++) {
	var p0 = allData.features[i].properties;
	if (p0.sac == nowInSAC) {
	var p = p0;
	//text += p.co_name + ' ' + p.state + ' ' + p.sac_area + ' ' + p.shape_leng + ' ' +  p.shape_area + ' ' + p.num_cblock;
	}
	
	}

var tooltipTxt = "<table class=\"summary-table\">";
tooltipTxt += "<tr><td colspan=2><b>" +  p.co_name + ", " + p.state + "</b></td></tr>";
tooltipTxt += "<tr><td>SAC ID:</td><td>" + p.sac + "</td></tr>";
tooltipTxt += "<tr><td>Number of Blocks:</td><td>" + p.num_cblock + "</td></tr></table>";

var sacDetailText = getSACDetailText(p.sac);

var sac_info = "<table class=\"summary-table\"><tr style=\"height: 30px\"><td colspan=2 style=\"vertical-align: bottom\"><b>Competitors in SAC:</b></td></tr>";
sac_info += "<tr><td>Name</td><td style=\"text-align: right\"># of Blocks</td></tr>";
for (i = 0; i < sacDetailText.providers.length; i++) {
sac_info += "<tr><td>" + sacDetailText.providers[i] + "</td><td style=\"text-align: right\">" + sacDetailText.number_blocks[i] + "</td></tr>";
}
sac_info += "</table>";

tooltipTxt += sac_info;

	//block info
	var num_provider = block_json.features.length;
	var block_fips = block_json.features[0].properties.block_fips
	var provider_names = "";
	var provider_list = [];
	for (i = 0; i < num_provider; i++) {
	var provider0 = block_json.features[i].properties.provider;
	if (provider0 != "none") {
	provider_list.push(block_json.features[i].properties.provider);
	}
	}
	provider_list = getUniqArray(provider_list);
	num_provider = provider_list.length;
	provider_names = "<table id='table-summary-competitor-text'>";
	for (i = 0; i < num_provider; i++) {
		provider_names += '<tr><td>' + provider_list[i] + '</td></tr>'
	}
	provider_names += '</table>';
	
tooltipTxt += "<table class=\"summary-table\"><tr style=\"height: 30px\"><td colspan=2 style=\"vertical-align: bottom\"><b>Block Info:</b></td></tr>";
tooltipTxt += "<tr><td>Block FIPS:</td><td> " + block_fips + "</td></tr>";
tooltipTxt += "<tr><td>Number of Competitors:</td><td>" + num_provider + "</td></tr>";
tooltipTxt += "<tr><td>Competitors:</td><td> " + provider_names + "</td></tr>";
tooltipTxt += "</table>";
	
	//$("#mapdata-display").html(tooltipTxt);
	$("#tabs-1-info").html(tooltipTxt);
	$( "#tabs" ).tabs({ active: 0 });


	}
	
	});
	
 }

function cleanFeatures(f) {
if (f.length <= 1) {
return f;
}
if (f.length > 1) {
var n_ring = [];
for (var i=0; i < f.length; i++) {


}

}


}
 
function getUniqArray(a) {
if (a.length < 2) {
return a;
}
var a = a.sort();
var u = [];
var b =[];
for (var i=0; i<a.length-1; i++) {
if (a[i] != a[i+1]) {
b.push(a[i]);
}
}
b.push(a[a.length-1]);
return b;
}
 
function getCoNameFromSAC(sac) {
for (var i = 0; i < allData.features.length; i++) {
var f = allData.features[i];
if (f.properties.sac == sac) {
return f.properties.co_name;
}
}

return "";

}
 
function mapClickAction(e) {
	var lat = e.latlng.lat;
	var lng = e.latlng.lng;
	//var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":caftwo_caf_counties_merge&maxFeatures=1&outputFormat=json&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))&callback=parseResponse&format_options=callback:parseResponse";
	var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":caftwo_caf_counties_merge&maxFeatures=1&outputFormat=text/javascript&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))&callback=parseResponse&format_options=callback:parseResponse";

	console.log(url)
	
	$.ajax({
		type: "GET",
		url: url,
		dataType: "jsonp",
		jsonpCallback: "parseResponse",
		success: function(data) {
			displayMapData(data);
		}
	});
}

function displayMapData(data) {
	if (map.hasLayer(clickedCounty)) {
		map.removeLayer(clickedCounty);
	}
	clickedCounty = L.mapbox.featureLayer(data).setStyle(countyStyleShown).addTo(map);
	p = data.features[0].properties;
	showCountyAndStateSummary(p.fips, p.county, p.state, p.total_pc)
}





function loadAllData() {
	var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_sabs&maxFeatures=100&sortBy=co_name&outputFormat=text/javascript&callback=parseResponse&format_options=callback:parseResponse";
	//var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_sabs&maxFeatures=100&sortBy=co_name&outputFormat=json&callback=parseResponse&format_options=callback:parseResponse";

	$.ajax({
			type: "GET",
			url: url,
			dataType: "jsonp",
			jsonpCallback: "parseResponse",
			success: function(data) {
			
				if (data.features[0].id.match(/overbuilt_sabs/)){
				allData = data;
				displayAllData();
				displayAllPins();
				}
			}
		});
}


function getProviderInfo() {
	var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=20000&propertyName=provider,sac_id&sortBy=provider,sac_id&outputFormat=text/javascript&callback=parseResponse&format_options=callback:parseResponse";
	//var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=20000&propertyName=provider,sac_id&sortBy=provider,sac_id&outputFormat=text/javascript";

	$.ajax({
			type: "GET",
			url: url,
			//dataType: "json",
			dataType: "jsonp",
			jsonpCallback: "parseResponse",
			success: function(data) {
			
				if (data.features[0].id.match(/overbuilt_blocks/)){
				providerInfo = data;
				processProviderInfo();
				}
				
			}
		});
}


function displayAllData() {

allDataLayer = L.geoJson(allData,  {
      style: styleShown,
      onEachFeature: onEachFeature
  }).addTo(map);
allDataLayer.setZIndex(999);

var infoText = makeInfoText();
//showInfo();
}

function displayAllPins() {

var latlon;
markers = [];
for (var i = 0; i < allData.features.length; i++) {
var f = allData.features[i];
var sac = f.properties.sac;

var co_name = f.properties.co_name;
latlon = getSACCenter(sac);
var option = {icon: L.mapbox.marker.icon({
				'marker-color': marker_color_off
			}),
			riseOffset: i,
			opacity: 0.5
			};
markers[i] = L.marker([latlon.lat, latlon.lon], option).addTo(map);

markers[i].on("mouseover", function(e) {
var index = e.target.options.riseOffset;

var icon0 = L.mapbox.marker.icon({
				'marker-color': marker_color_on
			});
markers[index].setIcon(icon0);
var co_name = allData.features[index].properties.co_name;
var sac = allData.features[index].properties.sac;
$("#feature_display_div").html(co_name + ' [SAC: ' + sac + ']');
$(".map-toolTip").show();
markers[index].setZIndexOffset(100);
});

markers[i].on("mouseout", function(e) {
var index = e.target.options.riseOffset;

var icon0 = L.mapbox.marker.icon({
				'marker-color': marker_color_off
			});
markers[index].setIcon(icon0);
$("#feature_display_div").html('');
$(".map-toolTip").hide();
markers[index].setZIndexOffset(0);


});

markers[i].on("click", function(e) {
var index = e.target.options.riseOffset;
var sac = allData.features[index].properties.sac;
clickedOnName(sac);
});



}
}


function processProviderInfo() {

var i, j;
var provider_name_sac_all = [];

for (i = 0; i < providerInfo.features.length; i++) {
provider_name_sac_all.push([providerInfo.features[i].properties.provider, providerInfo.features[i].properties.sac_id]);
}

//get unique
var provider_name_sac_uniq = [];
for (i = 0; i < provider_name_sac_all.length-1; i++) {
if (provider_name_sac_all[i][0] != provider_name_sac_all[i+1][0] || provider_name_sac_all[i][1] != provider_name_sac_all[i+1][1]) {
provider_name_sac_uniq.push(provider_name_sac_all[i]);
}
}
provider_name_sac_uniq.push(provider_name_sac_all[provider_name_sac_all.length-1]);

providerList = [];
for (i=0; i<provider_name_sac_uniq.length-1; i++) {
if (provider_name_sac_uniq[i][0] != provider_name_sac_uniq[i+1][0] && provider_name_sac_uniq[i][0] != 'none') {
providerList.push(provider_name_sac_uniq[i][0]);
}
}
providerList.push(provider_name_sac_uniq[provider_name_sac_uniq.length-1][0]);

providerSacLatLon = {};
for (i=0; i<providerList.length; i++) {
var sac_latlon_arr = [];
for (j = 0; j < provider_name_sac_uniq.length; j++) {
if (provider_name_sac_uniq[j][0] == providerList[i]){
var latlon = getSACCenter(provider_name_sac_uniq[j][1]);
var sac_latlon_item = {};
sac_latlon_item.sac = provider_name_sac_uniq[j][1];
sac_latlon_item.lat = latlon.lat;
sac_latlon_item.lon = latlon.lon;
sac_latlon_arr.push(sac_latlon_item);
}

}
providerSacLatLon[providerList[i]] = sac_latlon_arr;
}

var text = makeProviderText();

$("#tabs-3").html(text);
$(".provider").on("click", function(e) {
clickedOnProvider(e);
});

}


function clickedOnProvider(e) {
var id =e.target.id;
var provider = $("#" + id).html();
zoomToProvider(provider);
}

function removeAllPinsLayer() {
for (var i = 0; i < markers.length; i++) {
if (map.hasLayer(markers[i])) {
map.removeLayer(markers[i]);
}
}
}

function makeProviderText() {
var text = "<table id='provider-table' style=\"width: 100%\">";
text += "<tr style=\"font-size: 12px; font-weight: bold; border-bottom: solid 2px #000000\"><td>List of Competitors</td></tr>";
for (var i = 0; i < providerList.length; i++) {
text += '<tr><td id="' + i + '" class="provider">' + providerList[i] + '</td></tr>';
}
text += '</table>';

return text;
}


function getSACCenter(sac) {
var i;

var bbox = [0, 0, 0, 0];
for (i=0; i<allData.features.length; i++) {
if (allData.features[i].properties.sac == sac) {
var tmp_geojson = {"features": [allData.features[i]]};
var b = L.geoJson(tmp_geojson).getBounds();
bbox = [b._southWest.lng, b._southWest.lat,b._northEast.lng, b._northEast.lat];
}
}

var lat = (bbox[1] + bbox[3]) / 2;
var lon = (bbox[0] + bbox[2]) / 2;

return {"lat": lat, "lon": lon};
}


function makeInfoText() {
var f = allData.features;
var text = "<table id=\"company-table\">";
text += "<tr style=\"font-size: 12px; font-weight: bold; border-bottom: solid 2px #000000\"><td>List of Companies</td></tr>";
for (var i = 0; i < f.length; i++) {
var id = f[i].id;
id = id.replace(".", "-");
var co_name = f[i].properties.co_name;
var sac = f[i].properties.sac;
text += "<tr><td  id=\"" + sac + "\" class=\"co_name\">" + co_name + "</td></tr>";
}
text += "</table>";

$("#tabs-2").html(text);


$(".co_name").on("click", function(e) {
clickedOnName(e.target.id);
});

$(".co_name").on("mouseover", function(e) {
mouseOverName(e.target.id);
});

$(".co_name").on("mouseout", function(e) {
mouseOutName(e.target.id);
});

}

function mouseOverName(sac) {
for (var i =0; i < allData.features.length; i++) {
if (allData.features[i].properties.sac == sac) {
var index = i;
}
}
var icon0 = L.mapbox.marker.icon({
				'marker-color': marker_color_on
			});
markers[index].setIcon(icon0);
markers[index].setZIndexOffset(100);
}

function mouseOutName(sac) {
for (var i =0; i < allData.features.length; i++) {
if (allData.features[i].properties.sac == sac) {
var index = i;
}
}
var icon0 = L.mapbox.marker.icon({
				'marker-color': marker_color_off
			});
markers[index].setIcon(icon0);
markers[index].setZIndexOffset(0);
}


function clickedOnName(sac) {
activeTab = "company";
//remove provider pins
if (map.hasLayer(providerLayer)) {
map.removeLayer(providerLayer);
}
zoomToSAC(sac);

var co_json = {"type": "FeaturesCollection", "features": []};
var features = [];
for (var i = 0; i < allData.features.length; i++) {
var sac0 = allData.features[i].properties.sac;
if (sac0 == sac) {
features.push(allData.features[i]);
}
}

if (features.length == 0) {
return;
}

co_json.features = features;

$(".co_name").css({"font-weight": ""});
$("#" + sac).css({"font-weight": "bold"});

var p = co_json.features[0].properties;

var text = makeTooltipTxt(p);
//$("#feature_display_div").html(text);
$(".map-toolTip").hide();
$("#tabs-1-info").html(text);
$( "#tabs" ).tabs({ active: 0 });


$("#download-co-name").html(p.co_name + ' [SAC: ' + p.sac + ']');
$(".download-menu").show();

selected_sac = sac;
downloadWhat = "sac";
//selected_id = id;

  
}



function onEachFeature(feature, layer) {
      layer.on({
		mouseover: mouseover,
        mouseout: mouseout,
		click: click 
      });
  }

function onEachFeature_clicked(feature, layer) {
      layer.on({
		mouseover: mouseover_clicked,
        //mouseout: mouseout
      });
  }
  
function onEachFeature_allPins(feature, layer) {
      layer.on({
		mouseover: mouseover_allPins,
        mouseout: mouseout_allPins,
		click: click_allPins
      });
}
  
  
function mouseover(e) {
var layer = e.target;
var p = layer.feature.properties;
nowInSAC = p.sac;

if (map.hasLayer(nowInSACLayer)){
map.removeLayer(nowInSACLayer);
}
nowInSACLayer = L.geoJson(layer.feature, {style: styleMouseOver}).addTo(map);

for (var key in sacData) {
if (key == p.sac) {

return;
}

}

	var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=10000&outputFormat=text/javascript&callback=parseResponse&format_options=callback:parseResponse&cql_filter=sac_id='" + p.sac + "'";
	//var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=10000&outputFormat=json&callback=parseResponse&format_options=callback:parseResponse&cql_filter=sac_id='" + p.sac + "'";

	$.ajax({
			type: "GET",
			url: url,
			//dataType: "json",
			dataType: "jsonp",
			jsonpCallback: "parseResponse",
			success: function(data) {

			sacData[p.sac] = data;



			}
		});

}

function mouseover_clicked(e) {
var layer = e.target;
var p = layer.feature.properties;
var text = makeTooltipTxt(p);
$("#feature_display_div").html(text);
}

function mouseover_allPins(e) {
var layer = e.target;
var p = layer.feature.properties;
$("#feature_display_div").html(p.co_name);
$(".map-toolTip").show();
allPinsLayer.eachLayer(function (layer) {  

  //if(layer.feature.properties.NAME == 'feature 1') {    
   // layer.setStyle({fillColor :'blue'}) 
  //}
});
}

function mouseout_allPins(e) {
var layer = e.target;
var p = layer.feature.properties;
$(".map-toolTip").hide();
}

function click_allPins(e) {
var layer = e.target;
var p = layer.feature.properties;
clickedOnName(p.sac);

}


function mouseout(e) {
var layer = e.target;
layer.setStyle(styleShown);
//nowInSAC = "";
}


function click(e) {

var layer = e.target;
var p = layer.feature.properties;

if (map.hasLayer(clickedLayer)) {
map.removeLayer(clickedLayer);
}

clickedLayer = L.geoJson(layer.feature,  {
      style: styleClicked,
      onEachFeature: onEachFeature_clicked
  }).addTo(map);
  
var p = layer.feature.properties;

var text = makeTooltipTxt(p);
$("#feature_display_div").html(text);

var id = layer.feature.id;
id = id.replace(".", "-");
selected_id = id;
$(".co_name").css({"font-weight": ""});
$("#" + id).css({"font-weight": "bold"});

$("#download-co-name").html(p.co_name);
$(".download-menu").show();
}

function makeTooltipTxt(p) {
var tooltipTxt = "<table class=\"summary-table\"><tr><td colspan=2 style=\"text-align: center; font-weight: bold\">" + p.co_name + "</td></tr>";
tooltipTxt += "<tr><td>SAC ID: </td><td>" + p.sac + "</td></tr>";
tooltipTxt += "<tr><td>Number of Blocks: </td><td>" + p.num_cblock + "</td></tr>";
tooltipTxt += "</table>";

var tooltipTxt = "<table class=\"summary-table\">";
tooltipTxt += "<tr><td colspan=2><b>" +  p.co_name + ", " + p.state + "</b></td></tr>";
tooltipTxt += "<tr><td>SAC ID:</td><td>" + p.sac + "</td></tr>";
tooltipTxt += "<tr><td>Number of Blocks:</td><td>" + p.num_cblock + "</td></tr></table>";


return tooltipTxt;
}

function getSACDetailText(sac) {

if (sacData) {
var data_ok = false;
for (var key in sacData) {
if (key == sac) {
data_ok = true;
}
}
}

if (data_ok) {

var n = sacData[sac].features.length;
var providers = [];
for (var i = 0; i < n; i++) {
providers.push(sacData[sac].features[i].properties.provider);
}
var providers_uniq = getUniqArray(providers);

var num_for_uniq = [];
for (i = 0; i < providers_uniq.length; i++) {
num_for_uniq[i] = 0;
for (var j = 0; j < providers.length; j++) {
if (providers_uniq[i] == providers[j]) {num_for_uniq[i]++;}
}
}

var text = {"providers": providers_uniq, "number_blocks": num_for_uniq}

return text;

}
else {
return "";
}

}



function downloadFile(e) {
var type = e.target.id;
if (type == "shapefile"){
var type0 = "shape-zip";
}
if (type == "geojson"){
var type0 = "application/json";
var type0 = "json";
}
if (type == "csv"){
var type0 = "csv";
}
if (type == "gml"){
var type0 = "gml2";
}


if (downloadWhat == "sac" || downloadWhat == "co_name") {
var sac = selected_sac;
var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=20000&outputFormat=" + type0 + "&cql_filter=sac_id=%27" + sac + "%27";
}
else {
var provider = selected_provider;
provider = provider.replace(/ /g, "+");
var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + geo_space + ":overbuilt_blocks&maxFeatures=20000&outputFormat=" + type0 + "&cql_filter=provider=%27" + provider + "%27";
}

var newwin = window.open(url);

}














function makeMapdataTxt(fips, county, state, total_pc) {
if (typeof(county_mapdata[fips]) != "undefined") {
var data = county_mapdata[fips];
}
else {
data = [];
}

county = county.replace(' city', ' City');

var county_text = "&nbsp;<span style=\"font-size: 17px; font-weight: bold\">County Summary</span><br><b>&nbsp;" + county + ", " + state + "</b><br>  &nbsp;Total Price Cap (PC) County Locations: " + total_pc + "<table style=\"width: 100%; padding: 15px; border: solid 0px #cccccc\"><tr><th style=\"width: 30%; text-align: left\">PC Carrier</th><th width=18% style=\"text-align: center; vertical-align: bottom\">State</th><th width=23% align=center>Eligible Locations</th><th width=29%>Support Amount</th></tr>";
county_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=4></td></tr>";
var loc_t = 0;
var sup_t = 0;
for (var i = 0; i < data.length; i++) {
var data1 = data[i];

if (data1[2] != "") {
loc_t += parseInt(data1[2].replace(/,/, ""));
}
if (data1[3] != "") {
sup_t += parseInt(data1[3].replace(/,/g, ""));
}

var dollar = data1[3];
if (dollar != '') {
dollar = "$" + dollar;
}
county_text += "<tr><td style=\"text-align: left; vertical-align: bottom\">" + data1[1] + "</td><td style=\"text-align: center; vertical-align: bottom\" >" + data1[0] + "</td><td>" + data1[2] + "</td><td>" + dollar + "</td></tr>";
}
loc_t = addComma(loc_t);
sup_t = "$" + addComma(sup_t);
county_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=4></td></tr>";
county_text += "<tr><td style=\"text-align: left; vertical-align: bottom\">" + "<b>Total</b>" + "</td><td>" + "" + "</td><td><b>" + loc_t + "</b></td><td><b>" + sup_t + "</b></td></tr>";
county_text += "</table>";


//state
var state_text = "&nbsp;<span style=\"font-size: 17px; font-weight: bold\">" + state_name[state] + " State Summary</span>" + "<table style=\"width: 100%; margin-bottom: 5px; padding: 15px; border: solid 0px #cccccc\"><tr><th style=\"width: 30%; text-align: left\" >PC Carrier</th><th width=18%></th><th style=\"width: 23%\">Eligible Locations</th><th style=\"width: 29%\">Support Amount</th></tr>";
state_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=4></td></tr>";
if (typeof(state_mapdata[state]) != "undefined") {
var data = state_mapdata[state];
}
else {
var data = []; 
}

var loc_t = 0;
var sup_t = 0;
for (var i = 0; i < data.length; i++) {
var data1 = data[i];
var loc = addComma(data1[1]);
var sup = "$" + addComma(data1[2]);

if (data1[1] != "") {
loc_t += parseInt(data1[1]);
}
if (data1[2] != "") {
sup_t += parseInt(data1[2]);
}

state_text += "<tr><td style=\"text-align: left\">" + data1[0] + "</td><td></td><td>" + loc + "</td><td>" + sup + "</td></tr>";
}
loc_t = addComma(loc_t);
sup_t = "$" + addComma(sup_t);
state_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=4></td></tr>";
state_text += "<tr><td style=\"text-align: left\"><b>" + "Total" + "</b></td><td></td><td><b>" + loc_t + "</b></td><td><b>" + sup_t + "</b></td></tr>";
state_text += "</table>";

//nation
var nation_text = "<p style=\"text-align: center\"><span style=\"font-size: 17px; font-weight: bold\">Nationwide Summary</span></p>" + "<table style=\"width: 100%; margin-bottom: 5px; padding: 15px; border: solid 0px #cccccc\"><tr><th style=\"width: 30%; text-align: left\">PC Carrier</th><th width=5%></th><th style=\"width: 30%\">Eligible Locations</th><th width=5%></th><th style=\"width: 30%\">Support Amount</th></tr>";
nation_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=5></td></tr>";
if (typeof(nation_mapdata["nation"]) != "undefined") {
var data = nation_mapdata["nation"];
}
else {
var data = []; 
}

var loc_t = 0;
var sup_t = 0;
for (var i = 0; i < data.length; i++) {
var data1 = data[i];
var loc = addComma(data1[1]);
var sup = "$" + addComma(data1[2]);

if (data1[1] != "") {
loc_t += parseInt(data1[1]);
}
if (data1[2] != "") {
sup_t += parseInt(data1[2]);
}

nation_text += "<tr><td style=\"text-align: left\">" + data1[0] + "</td><td></td><td>" + loc + "</td><td></td><td>" + sup + "</td></tr>";
}
loc_t = addComma(loc_t);
sup_t = "$" + addComma(sup_t);
nation_text += "<tr style=\"width: 100%; height: 1px; background-color: #ddd\"><td colspan=5></td></tr>";
nation_text += "<tr><td style=\"text-align: left\"><b>" + "Total" + "</b></td><td></td><td><b>" + loc_t + "</b></td><td></td><td><b>" + sup_t + "</b></td></tr>";
nation_text += "</table>";

return {"county": county_text, "state": state_text, "nation": nation_text};
}


function addComma(n) {
n = n.toString();
str = "";
for (var i=0; i < n.length; i++){
	var place = n.length - i;
	if (((place-1)%3) == 0 && place > 1) {
		str += n[i] + ",";
	}
	else {
		str += n[i]
	}

}

return str;

}

function showCountyAndStateSummary(fips, county, state, total_pc) {
	var mapdataTxt = makeMapdataTxt(fips, county, state, total_pc);
	var countyMapdataTxt = mapdataTxt.county;
	var stateMapdataTxt = mapdataTxt.state;
	var nationMapdataTxt = mapdataTxt.nation;
	var mapdata_table = countyMapdataTxt + "<br>" + stateMapdataTxt;
	$("#mapdata-display").html(mapdata_table);

}

function showNationMapData() {
	var mapdataTxt = makeMapdataTxt("", "", "");
	var countyMapdataTxt = mapdataTxt.county;
	var stateMapdataTxt = mapdataTxt.state;
	var nationMapdataTxt = mapdataTxt.nation;
	var mapdata_table = nationMapdataTxt;
	$("#mapdata-display").html(mapdata_table);

}

 function setListener() {

     $("#input-loc-search").on("click", function(e) {
         e.preventDefault();
         locChange();
     });

	 $("#input-sac-search").on("click", function(e) {
         e.preventDefault();
         searchSAC();
     });
	 
	 $("#input-co_name-search").on("click", function(e) {
         e.preventDefault();
         searchCoName();
     });
	 
	 $("#input-provider-search").on("click", function(e) {
         e.preventDefault();
         searchProvider();
     });
	 
     $('#btn-geoLocation').click(function(event) {
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(function(position) {
                 var geo_lat = position.coords.latitude;
                 var geo_lon = position.coords.longitude;
                 var geo_acc = position.coords.accuracy;

                 map.setView([geo_lat, geo_lon], 12);
				 
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

	$('#input-location').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-loc-search').click();
	    return false;  
	  }
	});  
	
	$('#input-sac').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-sac-search').click();
	    return false;  
	  }
	});
	
	$('#input-co_name').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-co_name-search').click();
	    return false;  
	  }
	});
	
	$('#input-provider').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-provider-search').click();
	    return false;  
	  }
	});

	$( "#input-sac" ).autocomplete({
        source: function( request, response ) {
			var sac = request.term;
			sac_list = getSacList(sac);
			response(sac_list);
			

        },
        minLength: 2,
        select: function( event, ui ) {
            setTimeout(function() {searchSAC();}, 200);
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
	$( "#input-co_name" ).autocomplete({
        source: function( request, response ) {
			var co_name = request.term;
			co_name_list = getCoNameList(co_name);
			response(co_name_list);
			
        },
        minLength: 2,
        select: function( event, ui ) {
            setTimeout(function() {searchCoName();}, 200);
			//searchSAC();
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
	
	$( "#input-provider" ).autocomplete({
        source: function( request, response ) {
			var provider = request.term;
			provider_list = getProviderList(provider);
			response(provider_list);

        },
        minLength: 2,
        select: function( event, ui ) {
            setTimeout(function() {searchProvider();}, 200);

        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
	$("#input-search-switch").on('click', 'a', function(e) {
		var search = $(e.currentTarget).data('value');

		e.preventDefault();	

		$("#input-sac").val('');
        $("#input-location").val('');
		$("#input-co_name").val('');
		$("#input-provider").val('');
		
		if (search == 'loc') {
			$("#input-sac").css('display', 'none');
			$("#span-sac-search").css('display', 'none');
			$("#input-co_name").css('display', 'none');
			$("#span-co_name-search").css('display', 'none');
			$("#input-provider").css('display', 'none');
			$("#span-provider-search").css('display', 'none');
			
			$("#input-location").css('display', 'block');
			$("#span-location-search").css('display', 'table-cell');
			$("#btn-label").text('Location');
        }

        else if (search == 'sac') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-co_name").css('display', 'none');
			$("#span-co_name-search").css('display', 'none');
			$("#input-provider").css('display', 'none');
			$("#span-provider-search").css('display', 'none');
			
            $("#input-sac").css('display', 'block');
            $("#span-sac-search").css('display', 'table-cell');
			$("#btn-label").text('SAC');
        }
		
		else if (search == 'co_name') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-sac").css('display', 'none');
			$("#span-sac-search").css('display', 'none');
			$("#input-provider").css('display', 'none');
			$("#span-provider-search").css('display', 'none');
			
            $("#input-co_name").css('display', 'block');
            $("#span-co_name-search").css('display', 'table-cell');
			$("#btn-label").text('Company');
        }
		
		else if (search == 'provider') {
		    $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
			$("#input-sac").css('display', 'none');
			$("#span-sac-search").css('display', 'none');
			$("#input-co_name").css('display', 'none');
			$("#span-co_name-search").css('display', 'none');
			
            $("#input-provider").css('display', 'block');
            $("#span-provider-search").css('display', 'table-cell');
			$("#btn-label").text('Competitor');
        }
		
		
		
		
	});
	
    
 }
 

 function locChange() {

     var loc = $("#input-location").val();
     geocoder.query(loc, codeMap);
 }


  function codeMap(err, data) {
     //alert(JSON.stringify(data));

     var lat = data.latlng[0];
     var lon = data.latlng[1];

     if (data.lbounds) {
         map.fitBounds(data.lbounds);
     } else if (data.latlng) {
         map.setView([lat, lon], 15);
     }
 }
 
 
 
 
 function showSearchedCounty(data) {
 
 if (data.features[0].properties){
	if (map.hasLayer(clickedCounty)) {
		map.removeLayer(clickedCounty);
	}
	clickedCounty = L.mapbox.featureLayer(data).setStyle(countyStyleSearched).addTo(map);
	map.fitBounds(clickedCounty.getBounds());
		
	var p = data.features[0].properties;
	
	showCountyAndStateSummary(p.fips, p.county, p.state, p.total_pc);
	}

}

 function showMapLegendBox() {
     $("#map-legend-box").show()
 }

 function hideMapLegendBox() {
     $("#map-legend-box").hide()
 }
 
 function getSacList(sac) {
 var sac_list = [];
 var pat = '^' + sac + '.*';
 var re = new RegExp(pat, "g");
 var f = allData.features;
 for (var i = 0; i < f.length; i++) {
	var sac0 = f[i].properties.sac;
	if (sac0.match(re)) {
	sac_list.push(sac0);
	}
 }
 
 return sac_list;
 }
 
 function getCoNameList(co_name) {
 
 var pat_first = '^' + co_name + '.*';
 var re_first = new RegExp(pat_first, 'gi');
 var pat_other = '.*' + co_name + '.*';
 var re_other = new RegExp(pat_other, 'gi');
 
 var f = allData.features;
 var list_first = [];
 var list_other = [];
 for (var i = 0; i < f.length; i++) {
 var name = f[i].properties.co_name;
 if (name.match(re_first)){
 list_first.push(name);
 }
 else if (name.match(re_other)) {
  list_other.push(name);
 }
 }
 
var list_all = list_first.concat(list_other);
list_all = list_all.slice(0, 10);

return list_all;
 }
 
 
 function getProviderList(provider) {
 
 var pat_first = '^' + provider + '.*';
 var re_first = new RegExp(pat_first, 'gi');
 var pat_other = '.*' + provider + '.*';
 var re_other = new RegExp(pat_other, 'gi');
 
 var list_first = [];
 var list_other = [];
 
 for (var i = 0; i < providerList.length; i++) {
 if (providerList[i].match(re_first)){
 list_first.push(providerList[i]);
 }
 else if (providerList[i].match(re_other)) {
  list_other.push(providerList[i]);
 }
 }
 
var list_all = list_first.concat(list_other);
list_all = list_all.slice(0, 10);

return list_all; 
}
 
 
 
function searchSAC() {

var sac = $("#input-sac").val();

var sac_json = {"type": "FeaturesCollection", "features": []};
var features = [];
for (var i = 0; i < allData.features.length; i++) {
var sac0 = allData.features[i].properties.sac;
if (sac0 == sac) {
features.push(allData.features[i]);
}
}

if (features.length == 0) {
return;
}

sac_json.features = features;
sacSelectedLayer = L.geoJson(sac_json);
var b = sacSelectedLayer.getBounds();
map.fitBounds(b);

//display company info on right side bar
var p = sac_json.features[0].properties;
var text = getCompanyInfo(p);

$("#tabs-1-info").html(text);
$("#tabs").tabs({active: 0});

$("#download-co-name").html(p.co_name + " [SAC: " + p.sac + "]");
$(".download-menu").show();
selected_sac = sac;
downloadWhat = "sac";

activeTab = "company";
//remove provider pins
if (map.hasLayer(providerLayer)) {
map.removeLayer(providerLayer);
}

}

function searchCoName() {
var co_name = $("#input-co_name").val();

var sac_json = {"type": "FeaturesCollection", "features": []};
var features = [];
for (var i = 0; i < allData.features.length; i++) {
var co_name0 = allData.features[i].properties.co_name;
if (co_name0 == co_name) {
features.push(allData.features[i]);
}
}

if (features.length == 0) {
return;
}

sac_json.features = features;
sacSelectedLayer = L.geoJson(sac_json);
var b = sacSelectedLayer.getBounds();
map.fitBounds(b);

//display company info on right side bar
var p = sac_json.features[0].properties;
var text = getCompanyInfo(p);

$("#tabs-1-info").html(text);
$("#tabs").tabs({active: 0});


$("#download-co-name").html(p.co_name + " [SAC: " + p.sac + "]");
$(".download-menu").show();
selected_co_name = co_name;
selected_sac = p.sac;
downloadWhat = "co_name";

}
 
 function getCompanyInfo(p) {
 var tooltipTxt = "<table class=\"summary-table\">";
tooltipTxt += "<tr><td colspan=2><b>" +  p.co_name + ", " + p.state + "</b></td></tr>";
tooltipTxt += "<tr><td>SAC ID:</td><td>" + p.sac + "</td></tr>";
tooltipTxt += "<tr><td>Number of Blocks:</td><td>" + p.num_cblock + "</td></tr>";
tooltipTxt += "</table>";

 return tooltipTxt;
 }
 
 function searchProvider() {
var provider = $("#input-provider").val();

zoomToProvider(provider);

return;

var sac_latlon = providerSacLatLon[provider];

var features = [];
for (var i = 0; i < sac_latlon.length; i++) {
var feature = {"type": "Feature",
				"geometry": {"type": "Point", "coordinates": [sac_latlon[i].lon, sac_latlon[i].lat]},
				"properties": {"sac": sac_latlon[i].sac, "marker-title": sac_latlon[i].sac}
				};
features.push(feature);
};

var json_provider = {"type": "FeatureCollection", "features": features};

if (map.hasLayer(providerLayer)) {
map.removeLayer(providerLayer);
}

providerLayer = L.geoJson(json_provider, {
			onEachFeature: onEachFeature_provider
			
			}).addTo(map);

if (json_provider.features.length > 1) {
var b = providerLayer.getBounds();
map.fitBounds(b);
}
else {
var sac = json_provider.features[0].properties.sac;
zoomToSAC(sac);
}

var text = getProviderText(provider);

$("#mapdata-display").html(text);

$("#download-co-name").html(provider);
$(".download-menu").show();
selected_provider = provider;
downloadWhat = "provider";

}
 
 
 function zoomToProvider(provider) {

activeTab = "competitor";
removeAllPinsLayer();

var sac_latlon = providerSacLatLon[provider];

var features = [];
for (var i = 0; i < sac_latlon.length; i++) {
var feature = {"type": "Feature",
				"geometry": {"type": "Point", "coordinates": [sac_latlon[i].lon, sac_latlon[i].lat]},
				"properties": {"sac": sac_latlon[i].sac, "marker-title": sac_latlon[i].sac}
				};
features.push(feature);
};

var json_provider = {"type": "FeatureCollection", "features": features};

if (map.hasLayer(providerLayer)) {
map.removeLayer(providerLayer);
}

providerLayer = L.geoJson(json_provider, {
			onEachFeature: onEachFeature_provider
			
			}).addTo(map);

if (json_provider.features.length > 1) {
var b = providerLayer.getBounds();
map.fitBounds(b);
}
else {
var sac = json_provider.features[0].properties.sac;
zoomToSAC(sac);
}

var text = getProviderText(provider);

$("#tabs-1-info").html(text);
$( "#tabs" ).tabs({ active: 0 });

$("#download-co-name").html(provider);
$(".download-menu").show();
selected_provider = provider;
downloadWhat = "provider";

}
 

function getProviderText(provider) {

var text = '<table class="summary-table">';
text += "<tr><td>Competitor: </td><td>" + provider + "</td></tr>";
var sac_latlon = providerSacLatLon[provider];
var str1 = "";
for (var i = 0; i < sac_latlon.length; i++) {
str1 += "<span style=\"cursor: pointer; color: #3333AA; hover: {color: #FFFF00}\" onclick=\"zoomToSAC('" + sac_latlon[i].sac + "')\">" + sac_latlon[i].sac + "</span><br>";

}

text += "<tr><td>Overlapping SACs:</td><td> " + str1 + "</td></tr>";
text += "</table>";

return text;
}
 
function onEachFeature_provider(feature, layer) {
      layer.on({
		click: click_provider
      });
  }
 
 
function click_provider(e) {
var layer = e.target;
var p = layer.feature.properties;
zoomToSAC(p.sac);
}
 
function zoomToSAC(sac) {
var f = getFeatureBySAC(sac);
var layer = L.geoJson(f);
var b = layer.getBounds();
map.fitBounds(b);

}
 
function getFeatureBySAC(sac) {
var f = {};
for (var i = 0; i < allData.features.length; i++) {
if (allData.features[i].properties.sac == sac) {
f = allData.features[i];
}
}

return f;
}

 
 

 $(document).ready(function() {
	 $( "#tabs" ).tabs({ active: 1 });
     createMap();
     setListener();
	 loadAllData();
	 setTimeout(function(){ getProviderInfo(); }, 2000);
	 
	 
	$(function() {
		$( "#tabs" ).tabs();
	});

     $('.btn-legend').click(function(){ 
        $(this).hide();
        $('.legend').show('fast');
    });

    $('.btn-closeLegend').click(function() { 
        $('.legend').hide('fast');
        $('.btn-legend').show();
    });

    $('.links-download').on('click', 'a', function(e) {
        downloadFile(e);
    }).on('click', '.btn', function(e) {
        $('#download-menu-box').hide();
    });

    $('#download-btn-small').on('click', function(){
        setDownloadSelect();
        $("#download-menu-box").show('fast');
    });
});



