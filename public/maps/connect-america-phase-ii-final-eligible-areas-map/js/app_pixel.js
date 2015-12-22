/*
    __________________   __  ___                
   / ____/ ____/ ____/  /  |/  /___ _____  _____
  / /_  / /   / /      / /|_/ / __ `/ __ \/ ___/
 / __/ / /___/ /___   / /  / / /_/ / /_/ (__  ) 
/_/    \____/\____/  /_/  /_/\__,_/ .___/____/  
                                 /_/            
*/

/*
var geo_host = '//www.broadbandmap.gov';
var geo_space = 'fcc';
var geo_output = 'json'
*/

//var geo_host = 'http://ldevtm-geo02:8080';
var geo_host = 'http://ltsttm-geo02a:8080';
var geo_space = 'geo_swat';
var geo_output = 'application/json'

var nn = 0;
var map;
var shownPolyCounty;
var clickedCounty;

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
	fillColor: '#FFFFFF',
    weight: 5,
    opacity: 1.0,
    fillOpacity: 0.0
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
             maxZoom: 13
         })
         .setView([45, -110], 3);

     map.attributionControl.addAttribution('<a href="http://fcc.gov/maps">FCC Maps</a>');

     baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge').addTo(map);
     baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
     baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');

    var wms_nonfrozen_class_1 = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_nonfrozen_class_1'
     });

    var wms_nonfrozen_class_2 = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_nonfrozen_class_2'
     });
	 
	var wms_nonfrozen_class_3 = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_nonfrozen_class_3'
     });
	 
	var wms_nonfrozen_class_4 = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_nonfrozen_class_4'
     });
	 
	var wms_frozen = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_frozen'
    });
	var wms_counties_merge = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':caftwo_caf_counties_merge'
    });
	var wms_state_2010 = L.tileLayer.wms(geo_host +'/geoserver/gwc/service/wms?tiled=true', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':state_2010'
    });

     L.control.scale({
         position: 'bottomright'
     }).addTo(map);

     geocoder = L.mapbox.geocoder('mapbox.places-v1');

     L.control.layers({
         'Street': baseStreet.addTo(map),
         'Satellite': baseSatellite,
         'Terrain': baseTerrain
     }, {
		'Eligible': wms_nonfrozen_class_4.addTo(map),
		'Ineligible - Exceeds Threshold': wms_nonfrozen_class_1.addTo(map),
		'Ineligible - Below Benchmark': wms_nonfrozen_class_2.addTo(map),
		'Ineligible - Other': wms_nonfrozen_class_3.addTo(map),
		'Elected Frozen': wms_frozen.addTo(map),
		'Counties': wms_counties_merge,
		'States': wms_state_2010.addTo(map)
     }, {
         position: 'topleft'
     }).addTo(map);
	 
	 //show legend by default
	$('.legend').show('fast');
	
	map.on("zoomend dragend", function(e) {
	
	if (map.getZoom() >= 7) {
		if (!map.hasLayer(wms_counties_merge)) {
			map.addLayer(wms_counties_merge);
		}
	}
	else {
		//remove county layer
		if (map.hasLayer(wms_counties_merge)) {
			map.removeLayer(wms_counties_merge);
		}
		//remove clicked county geom
		if (map.hasLayer(clickedCounty)) {
			map.removeLayer(clickedCounty);
		}
		showNationMapData();
	}
	
	//will implement pixel color reading when cross-domain issue resolves
	//refreshCanvas();
	
	});
	
	map.on("click", function(e) {
	mapClickAction(e);
	});
 }

function mapClickAction(e) {
	var lat = e.latlng.lat;
	var lng = e.latlng.lng;
	var url = geo_host + "/geoserver/" + geo_space+ "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geo_swat:caftwo_caf_counties_merge&maxFeatures=1&outputFormat=text/javascript&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))";

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


function parseResponse(data) {

}

function applyCountyLayer() {

countyLayer = L.geoJson(all_counties,  {
      style: countyStyleHidden,
      //onEachFeature: onEachFeature
  }).addTo(map);
}

function onEachFeature(feature, layer) {
      layer.on({
		mouseover: mouseover,
        mouseout: mouseout
      });
  }

function mouseover(e) {

var layer = e.target;
var p = layer.feature.properties;
var tooltipTxt = makeTooltipTxt(p);

$("#tooltip_box_div").html(tooltipTxt);
$("#tooltip_box_div").show();

//set county border style
layer.setStyle(countyStyleShown);

showCountyAndStateSummary(p.fips, p.county, p.state)
}

function mouseout(e) {
var layer = e.target;
layer.setStyle(countyStyleHidden);
$("#tooltip_box_div").hide();
$("#mapdata-display").html('');
}

function makeTooltipTxt(p) {
var tooltipTxt = "<table width=100%>";
tooltipTxt += "<tr><td cellspan=2 align=center><span style=\"font-size: 13px; font-weight: bold\">" + p.county + ", " + p.state + "</span></td></tr>";

tooltipTxt += "<tr><td>Total Price Cap County Locations:</td><td align=right>" +  p.total_pc + "</td></tr>";
tooltipTxt +=  "<tr><td>Price Cap County Supported Locations:</td><td align=right>" + p.supported + "</td></tr>";
tooltipTxt += "<tr><td>Price Cap County Support:</td><td align=right>" +  "$" + p.pc_support + "</td></tr></table>";

return tooltipTxt;
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
    
 }
 

 function locChange() {

     var loc = $("#input-location").val();
     geocoder.query(loc, codeMap);
 }

 function codeMap(err, data) {
 
	if (data.latlng) {
		var lat = data.latlng[0];
		var lon = data.latlng[1];
    }
	else if (data.lbounds) {
		var lat = (data.lbounds.getSouth() + data.lbounds.getNorth()) / 2;
		var lon = (data.lbounds.getWest() + data.lbounds.getWest()) / 2;
    }
	else {
	return;
	}
	
	var url = geo_host + "/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geo_swat:caftwo_caf_counties_merge&maxFeatures=1&outputFormat=text/javascript&cql_filter=contains(geom,POINT(" + lon + " " + lat + "))" + "&format_options=callback:showSearchedCounty";

	$.ajax({
			type: "GET",
			url: url,
			//dataType: "json",
			dataType: "jsonp",
			jsonpCallback: "parseResponse",
			success: function(data) {
									
			}
		});
 }
 
 function showSearchedCounty(data) {
 	if (data.totalFeatures > 0) {
	if (map.hasLayer(clickedCounty)) {
		map.removeLayer(clickedCounty);
	}
	clickedCounty = L.mapbox.featureLayer(data).setStyle(countyStyleSearched).addTo(map);
	map.fitBounds(clickedCounty.getBounds());
		
	var p = data.features[0].properties;

	//var tooltipTxt = makeTooltipTxt(p);		
	//$("#tooltip_box_div").html(tooltipTxt);
	//$("#tooltip_box_div").show();
	
	showCountyAndStateSummary(p.fips, p.county, p.state, p.total_pc)
	
	}	
}

 function showMapLegendBox() {
     $("#map-legend-box").show()
 }

 function hideMapLegendBox() {
     $("#map-legend-box").hide()
 }
 
 
 
 //========= TILE CALCULATIONS
var tileSize = 256;
var initialResolution = 2 * Math.PI * 6378137 / tileSize;
var originShift = 2 * Math.PI * 6378137 / 2.0;
var zoomNow = 1;
var img = [];
var num, nx, ny;

 
 function refreshCanvas() {
 
 var zoomNow = map.getZoom();
 var b = map.getBounds();
 var south = b.getSouth();
 var north = b.getNorth();
 var west = b.getWest();
 var east = b.getEast();

 var txy1 = LatLonToTile(south, west, zoomNow);
 var tx1 = txy1[0];
 var ty1 = txy1[1];
 var txy2 = LatLonToTile(north, east, zoomNow);
 var tx2 = txy2[0];
 var ty2 = txy2[1];
 nx = tx2 - tx1 + 1;
 ny = ty2 - ty1 + 1;
 num = nx * ny;
 

 c = document.getElementById("canvas");
 ctx = c.getContext("2d");
 c1 = document.getElementById("canvas1");
 ctx1 = c.getContext("2d");


 var tileBounds = [];
 img = [];
 url = [];
 var n = 0;
 for (var tx = tx1; tx <= tx2; tx++) {
	for (var ty = ty1; ty <= ty2; ty++) {

		var bounds = TileBounds(tx, ty, zoomNow);
		var bbox = bounds[0] + "," + bounds[1] + "," + bounds[2] + "," + bounds[3];
		var xstart = (tx-tx1) * tileSize;
		var ystart = (ty2-ty) * tileSize;
		url[n] = "http://ltsttm-geo02a:8080/geoserver/gwc/service/wms?tiled=true&SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=geo_swat%3Acaftwo_nonfrozen_class_4&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=false&HEIGHT=256&WIDTH=256&SRS=EPSG%3A3857&BBOX=" + bbox;

		img[n] = new Image();

	img[n].src = url[n];
	n++;
 }
 }
 
setTimeout(function() { renderAllImg(); }, 500);
 
 }
 
 function renderAllImg() {


var allLoaded = true;
for (var i =0; i < num; i++) {
	if (!img[i].complete) {
		allLoaded = false
	}
}

if (allLoaded) {
 ctx.clearRect(0, 0, tileSize*nx, tileSize*ny);
for (var n = 0; n < num; n++) {
 var y = n % ny;
 var x = Math.floor(n/ny)
 var xstart = x * tileSize;
 var ystart = (ny-y-1) * tileSize;
 ctx.drawImage(img[n],xstart, ystart, 256, 256);
}


}
else {
setTimeout(function() { renderAllImg(); }, 500);
}
 
}
 
 
function LatLonToMeters(lat, lon) {
	var mx = lon * originShift / 180.0;
	var my = Math.log( Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0);
	my = my * originShift / 180.0;
	return [mx, my];
	}
 
function MetersToPixels(mx, my, zoom) {         
	res = Resolution(zoom);
	px = Math.round((mx + originShift) / res);
	py = Math.round((my + originShift) / res);
	return [px, py];
	}
	
function Resolution(zoom ) {
	return initialResolution / Math.pow(2, zoom);
}

function PixelsToTile(px, py) {
	var tx =  Math.ceil( px / tileSize ) - 1;
	var ty =  Math.ceil( py / tileSize ) - 1;
	return [tx, ty]
	}
 
function LatLonToTile(lat, lon, zoom) {
	var xy = LatLonToMeters(lat, lon);
	var mx = xy[0];
	var my = xy[1];
	var pxy = MetersToPixels(mx, my, zoom);
	var px = pxy[0];
	var py = pxy[1];
	var tx =  Math.ceil( px / tileSize ) - 1;
	var ty =  Math.ceil( py / tileSize ) - 1;
	return [tx, ty]
	}
 
function TileBounds(tx, ty, zoom) {
	var minxy = PixelsToMeters( tx*tileSize, ty*tileSize, zoom );
	var minx = minxy[0];
	var miny = minxy[1];
	var maxxy = PixelsToMeters( (tx+1)*tileSize, (ty+1)*tileSize, zoom );
	var maxx = maxxy[0];
	var maxy = maxxy[1];
	return [minx, miny, maxx, maxy]
 }
 
function PixelsToMeters(px, py, zoom) {
	res = Resolution( zoom )
	mx = px * res - originShift
	my = py * res - originShift
	return [mx, my]
}
 
 
 
 
 
 
 $(document).ready(function() {
     createMap();
     setListener();
	 //applyCountyLayer();
	 
	 showNationMapData()

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



