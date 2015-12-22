var electionType="";
var electionTypeText="";
var stateFips="";
var stateName="";
var mediaType="";
var mediaTypeText="";
var callSign="";
var apiHost = "http://165.135.239.37:8011/dataapi/ecd/";
var geoServerURL="http://165.135.239.37:8010/geoserver/";
var layers=[];
var cqlFilter="";

var fullExtent = new OpenLayers.Bounds(
        -17107255, 2910721, -4740355, 6335100
    );
//OpenLayers.DOTS_PER_INCH = 90.71428571428572;
var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    displayProjection: "EPSG:4326",
    numZoomLevels:17,
    maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
	units: "meters"
});


var stamenToner = new OpenLayers.Layer.XYZ(
	    "Stamen Toner map",
	    [
	        "http://a.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://b.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://c.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://d.tile.stamen.com/toner/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Map tiles by <a target='_top' href='http://stamen.com'>Stamen Design</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by " +
	        "<a target='_top' href='http://openstreetmap.org'>OpenStreetMap</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>",
	    	sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:17,
	        transitionEffect: "resize",
	        //isBaseLayer:true,
	        buffer: 1
	    }
	);
var stamenTerrain = new OpenLayers.Layer.XYZ(
	    "Stamen Terrain map",
	    [
	        "http://a.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://b.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://c.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://d.tile.stamen.com/terrain/${z}/${x}/${y}.png"
	    ], {
	    	attribution: "Map tiles by <a target='_top' href='http://stamen.com'>Stamen Design</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by " +
	        "<a target='_top' href='http://openstreetmap.org'>OpenStreetMap</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        transitionEffect: "resize",
	        numZoomLevels:17,
	        isBaseLayer:true,
	        buffer: 1
	    }
	);

layers.push(stamenToner);
//layers.push(stamenTerrain);

var itemStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
    	strokeColor: "#ed3f19",
		strokeOpacity: 1,
    	strokeWidth: 2,
		fillColor: "#FFAEDB",
		fillOpacity: 0.1
    }),
    "temporary": new OpenLayers.Style({
        strokeColor: "#F09100",
		strokeWidth:2
    })
});
var itemLayer= new OpenLayers.Layer.Vector("Item",{
		styleMap: itemStyle,					
		displayInLayerSwitcher:false
	});

layers.push(itemLayer);
map.addLayers(layers);

map.addControl(new OpenLayers.Control.MousePosition());
map.addControl(new OpenLayers.Control.Attribution());

map.zoomToExtent(fullExtent);
map.zoomTo(4);

function skipLinks() {
		// Enable Skiplinks to work in WebKit browsers (e.g. Safari and Chrome) 
		// Ref: http://www.communis.co.uk/blog/2009-06-02-skip-links-chrome-safari-and-added-wai-aria
		var is_webkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
		var is_opera = navigator.userAgent.toLowerCase().indexOf('opera') > -1;

		if (is_webkit || is_opera) {
				// send users to main content, just before #content-main
				var target1 = document.getElementById('skiptarget1');
				target1.href = "#skiptarget1";
				target1.innerText = "Start of main content";
				target1.setAttribute("tabindex", "0");
				document.getElementById('skip-main').setAttribute("onclick", "document.getElementById('skiptarget1').focus();");
				// send users to sidebar (if exists), just before #resources
				var target2 = document.getElementById('skiptarget2');
				target2.href = "#skiptarget2";
				target2.innerText = "Start of supporting content";
				target2.setAttribute("tabindex", "0");
				document.getElementById('skip-side').setAttribute("onclick", "document.getElementById('skiptarget2').focus();");
				if (document.getElementById('skip-side2')){
					document.getElementById('skip-side2').setAttribute("onclick", "document.getElementById('skiptarget2').focus();");
					document.getElementById('skip-side3').setAttribute("onclick", "document.getElementById('skiptarget2').focus();");    	
				}
				// send users to footer, just before #footer
				var target3 = document.getElementById('skiptarget3');
				target3.href = "#skiptarget3";
				target3.innerText = "Start of site information";
				target3.setAttribute("tabindex", "0");
				document.getElementById('skip-foot').setAttribute("onclick", "document.getElementById('skiptarget3').focus();");
		}
}

function populateCallSigns(){
	if (electionType != "" && mediaType !="" && stateFips != ""){
		var restEndPointURL=apiHost + "stations/" + electionType + "/state/" + stateFips + "/" +mediaType + "/all?format=jsonp&callback=?";
		$.getJSON(restEndPointURL, function(data){
		 	if (data.status == "OK") {
				if (typeof data.Results == "undefined") {
					errorHandling("data");
				}
				else {
					//console.log(data);
					$('#sel-stationID').autocomplete({
						select: function(event, ui) {
							callSign = ui.item.value;
						},
						source: data.Results
					});
				}				
			}
			else {
				errorHandling("api");
			}
	  	});	
	}
}



function getStationEligibility(){
	if (electionType != "" && mediaType !="" && stateFips != "" && callSign != ""){
		var restEndPointURL=apiHost + "eligibility/" + electionType + "/state/" + stateFips + "/" +mediaType + "/" + callSign +"?format=jsonp&callback=?";
		$.getJSON(restEndPointURL, function(data){
		 	if (data.status == "OK") {
				if (typeof data.Results == "undefined") {
					errorHandling("data");
				}
				else {
					//console.log(data);
					$('#resultText dd').eq(0).text(electionTypeText);
					$('#resultText dd').eq(1).text(stateName);
					$('#resultText dd').eq(2).text(mediaTypeText);
					$('#resultText dd').eq(3).text(callSign);
					$('#resultText dd').eq(4).text(getDate());
					var resultT="";
					if (data.Results[0]=="Y"){
						resultT="Yes, the above-cited media outlet can reach 50,000 or more people in the above-cited area."
					}
					else{
						resultT="No, the above-cited media outlet can not reach 50,000 or more people in the above-cited area."
					}
					$('#resultText dd').eq(5).text(resultT);
					
					//construct cql filter
					cqlFilter="geograp_01='" + stateFips + "' AND station_id='" + callSign + "' AND media_type='" + mediaTypeText + "' AND election_t='";
					var eleT;
					if (electionType=="presidential"){
						eleT="PRES";
					}
					else{
						eleT="FED_SENATE";
					}
					cqlFilter +=eleT + "'";
					
					mapItem();
				}				
			}
			else {
				errorHandling("api");
			}
	  	});	
	}
	else{
		alert("not all parameters being supplied");
	}
}

function mapItem(){
	var getItem=new OpenLayers.Protocol.Script({
		url: geoServerURL + "wfs",
		callback:addItemToMap,
		callbackKey: "format_options",
		callbackPrefix: "callback:",
		params: {
			service: "WFS",
			version: "1.1.0",
			srsName: "EPSG:900913",
			request: "GetFeature",
			typeName: "fcc:ecd_contour",
			propertyNames:"geom",
			CQL_FILTER:cqlFilter,
			//featureid:5,
			outputFormat: "json"
		}
	});
	getItem.read();
}

function addItemToMap(evt){
	var feats = evt.features;
	itemLayer.removeAllFeatures();
	itemLayer.addFeatures(feats);
	map.zoomToExtent(itemLayer.getDataExtent());
	//console.log(feats);
}



function errorHandling(errorType){
	var msg=null;
	if (errorType=="data"){
		msg="There is an issue with the API call.";
	}
	else if (errorType=="api"){
		msg="Data is not available."
	}
	//$('#dialog').children('p').html(msg).end().dialog('open');
	alert(msg);
}

function getDate(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
	return today;
}
	
	
$(document).ready(function(e) {

	$('#sel-State').chosen();
	//$('#sel-stationID').chosen();
	$('input[name="electType"]').change(function(){
		electionType=this.id;
		electionTypeText=$('input[name="electType"]:checked + label').text();
		populateCallSigns();
	})
	$('input[name="mediaType"]').change(function(){
		mediaType=this.id;
		mediaTypeText=$('input[name="mediaType"]:checked + label').text();
		populateCallSigns();
	})
	$("#sel-State").change(function(){
		stateFips = $("#sel-State option:selected").val();
		stateName = $("#sel-State option:selected").text();
		populateCallSigns();
	});
	
	$('#btn-Submit').click(function(e){
		e.preventDefault();
		getStationEligibility();	
		$('#mapResult').slideDown();
	});
	
	$('#mapResult').hide();
	
});