/*
    __________________   __  ___                
   / ____/ ____/ ____/  /  |/  /___ _____  _____
  / /_  / /   / /      / /|_/ / __ `/ __ \/ ___/
 / __/ / /___/ /___   / /  / / /_/ / /_/ (__  ) 
/_/    \____/\____/  /_/  /_/\__,_/ .___/____/  
                                 /_/            
*/

var geo_host = '//www.broadbandmap.gov';
var geo_space = 'fcc';
var geo_output = 'json'

var geo_host = 'http://gisp-geoserv-dock-dev02.elasticbeanstalk.com';
var geo_space = 'gisp';
var geo_output = 'text/javascript'

var map;
var shownPolySAC;
var shownPolySA;
var clickedPoly;
var isInsidePolyC = false;
var isInsidePoly = false;

var clickedPolyList = [];
var clickedPolyList = [];
var clickedPolyData = [];

var codeNowSAC;
var codeNowSA;

 var dataNowSAC = {
     "totalFeatures": 0
 };
 var dataNowSA = {
     "totalFeatures": 0
 };

var dataCredential = {};
var xNow;
var yNow;

 var shownPolyOptionSAC = {
     'color': '#ffff21',
     'fillColor': '#ffff21',
     'weight': 5,
     'fillOpacity': 0.2
 }

  var shownPolyOptionSA = {
     'color': '#fff',
     'fillColor': '#999',
     'weight': 3,
     'fillOpacity': 0.3
 }

  var clickedPolyOption = {
     'color': '#00ff00',
     'fillColor': '#00ff00',
     'weight': 4,
     'fillOpacity': 0.25
 }

 function createMap() {
 
     L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
     map = L.mapbox.map('map', 'fcc.k74ed5ge', {
             attributionControl: true,
             maxZoom: 19
         })
         .setView([40, -97], 3);

     map.attributionControl.addAttribution('<a href="http://fcc.gov/maps">FCC Maps</a>');

     baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge').addTo(map);
     baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
     baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');

     var wms_ror_sa = L.tileLayer.wms(geo_host +'/geoserver/wms', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':ror_sa'
     });

     var wms_ror_sac = L.tileLayer.wms(geo_host +'/geoserver/wms', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':ror_sac'
     });
     
     var wms_ror_co = L.tileLayer.wms(geo_host +'/geoserver/wms', {
         format: 'image/png',
         transparent: true,
         layers: geo_space +':ror_co'
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
		'Service Areas': wms_ror_sa.addTo(map),
		'Study Areas': wms_ror_sac.addTo(map),
		'Central Offices': wms_ror_co.addTo(map)
     }, {
         position: 'topleft'
     }).addTo(map);
	 
	map.on("click", function(e) {
		clickPoly(e);
	}); 	 
	 
	var gx = 0;
	var gy = 0;
	var nx, ny;
	var gsize = 16;
	 
	map.on("mousemove", function(e){		
		
		nx = Math.floor(e.containerPoint.x/gsize);
		ny = Math.floor(e.containerPoint.y/gsize);		
		
		if ((nx == gx) && (ny == gy) ){	
			// same grid
		}
		else {		
			
			gx = nx; 
			gy = ny; 
			
			var lat = e.latlng.lat;
			var lng = e.latlng.lng;		

			//SA
			var urlPolySA = geo_host +"/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sa&maxFeatures=1&outputFormat="+ geo_output +"&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))&format_options=callback:callbackSA";
			//var urlPolySA = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sa&maxFeatures=1&outputFormat="+ geo_output +"&cql_filter=contains(geom,%20POINT(" + lng + " " + lat + "))";

			isInsidePoly = false;
			if (map.hasLayer(shownPolySA)) {
				var results = leafletPip.pointInLayer([lng, lat], shownPolySA);
				if (results.length > 0) {
					isInsidePoly = true;
				}
			}

			if ((!isInsidePoly) || (codeNowSAC != codeNowSA)) {			
			
				$.ajax({
					type: "GET",
					url: urlPolySA,
					//dataType: "json",
					dataType: "jsonp",
					jsonpCallback: "callbackSA",
					success: function(dataSA) {
						console.log('hoverPoly sa');
						hoverPoly(dataSA, 'sa');
					}
				});	
			}
		}
	});

 }

 $('#btn-street').on('click', function(e) {
     e.preventDefault();
     changeBaseLayer('street');
 });
 $('#btn-satellite').on('click', function(e) {
     e.preventDefault()
     changeBaseLayer('satellite');
 });
 $('#btn-topo').on('click', function(e) {
     e.preventDefault();
     changeBaseLayer('topo');
 });

 function changeBaseLayer(type) {

     map.removeLayer(baseStreet);
     map.removeLayer(baseSatellite);
     map.removeLayer(baseTerrain);

     if (type == 'street') {
         baseStreet.addTo(map);
         toggleClass(type);
     }
     if (type == 'satellite') {
         baseSatellite.addTo(map);
         toggleClass(type);
     }
     if (type == 'topo') {
         baseTerrain.addTo(map);
         toggleClass(type);
     }

 }

 function toggleClass(type) {

     $('#btn-street').removeClass('btn-baselayer-control-selected');
     $('#btn-satellite').removeClass('btn-baselayer-control-selected');
     $('#btn-topo').removeClass('btn-baselayer-control-selected');

     $('#btn-' + type).addClass('btn-baselayer-control-selected');
 }

function hoverPoly(data, type) {
	//console.log('hoverpoly type: ' + type);
	if (type === 'sa') {		
		//console.log('hoverpoly sa');
		if (map.hasLayer(shownPolySA)) {
			map.removeLayer(shownPolySA);
		}
		
		dataNowSA = data;
		
		if (data.features.length > 0) {
			
			var featureSA_id = data.features[0].id.replace(/\..*$/, '');
			//console.log('featureSA_id sa : '+ featureSA_id);
			
			if (featureSA_id == "ror_sac") {
				
				//console.log(' ror_sac');				
				return;
			}

			if (dataNowSA.totalFeatures == 0) {
				$("#tooltip_box_div").hide();
				map.removeLayer(shownPolySA);
				return;
			}
			
			var sac = dataNowSA.features[0].properties.sac;
			var sa = dataNowSA.features[0].properties.sa;
			var company = dataNowSA.features[0].properties.company;
			var source = dataNowSA.features[0].properties.node0sourc;

			shownPolySA = L.mapbox.featureLayer(dataNowSA).setStyle(shownPolyOptionSA).addTo(map);
			shownPolySA.on("click", function(e) {
				clickPoly(e);
			});

			shownPolySA.setZIndex(999);
			var text = "Study Area Code:" + sac + 
				"<br/ > Company:" + company + 
				"<br/ > Service Area:" + sa + 
				"<br />Source: " + source;

			$("#feature_display_div").html(text);
			$("#tooltip_box_div").show();
			
			// get sac layer
			
			codeNowSA = sac;			

			if (codeNowSAC != codeNowSA) {	

				var urlPolySAC = geo_host +"/geoserver/" + geo_space + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&maxFeatures=1&outputFormat="+ geo_output +"&cql_filter=sac="+ sac +"&format_options=callback:callbackSAC";
				//var urlPolySAC = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&maxFeatures=10&outputFormat="+ geo_output +"&cql_filter=sac="+ sac +"";

				$.ajax({
					type: "GET",
					url: urlPolySAC,
					//dataType: "json",
					dataType: "jsonp",
					jsonpCallback: "callbackSAC",
					success: function(dataSAC) {
						hoverPoly(dataSAC, 'sac');						
					}
				});	
			}			
		}
		else {
			
			//console.log('remove sac');
			
			if (map.hasLayer(shownPolySAC)) {
				map.removeLayer(shownPolySAC);
			}
			codeNowSAC = false;
			$("#tooltip_box_div").hide();			
		}
	}
	else if (type === 'sac') {	
	
		//console.log('hoverpoly sac');
		
		if (map.hasLayer(shownPolySAC)) {
			map.removeLayer(shownPolySAC);
		}
		
		dataNowSAC = data;		
		
		if (data.features.length > 0) {
		
			 var featureSAC_id = data.features[0].id.replace(/\..*$/, '');
			 //console.log('featureSAC_id : '+ featureSAC_id);
			 
			 if (featureSAC_id == "ror_sa") {
				//console.log(' ror_sa');
				return;
			 }
			 
			 var sac = dataNowSAC.features[0].properties.sac;
			//console.log('sac : ' + sac );			 
			codeNowSAC = sac;
			//console.log('codeNowSAC : ' + codeNowSAC );				 

			 shownPolySAC = L.mapbox.featureLayer(dataNowSAC).setStyle(shownPolyOptionSAC).addTo(map);
			 shownPolySAC.on("click", function(e) {
				clickPoly(e);
			});

			 shownPolySAC.setZIndex(888);
		}	
	}
 }

 function clickPoly(e) { 
	
	
	//console.log('clickedPolyList : '+  clickedPolyList );
	//console.log('clickedPolyList.length : '+  clickedPolyList.length );	
	
	//console.log('dataNowSA.totalFeatures : '+  dataNowSA.totalFeatures );
	
     if (dataNowSA.totalFeatures == 0) {
         
		 //clearClickedPoly();
		 
		 $("#tooltip_box_div").hide();
     }
	 else {

		var inPolyList = $.inArray(codeNowSAC, clickedPolyList);

		//console.log('inPolyList : ' + inPolyList);
		 
		if (inPolyList < 0) {	
			
			//console.log('clickedPolyList.length : '+  clickedPolyList.length );	
			
			clearClickedPoly();

			//console.log('clickedPolyList.length : '+  clickedPolyList.length );	
			//console.log('clickedPolyData.length : '+  clickedPolyData.length );	
		
			var clickedPolyLayer = L.mapbox.featureLayer(dataNowSAC).setStyle(clickedPolyOption).addTo(map);
			
			clickedPolyLayer.on("click", function(e) {
				clickPoly(e);
			});			
			
			clickedPolyList.push(codeNowSAC);
			clickedPolyData.push(clickedPolyLayer);		
			
		}
		else {
			
			if (map.hasLayer(clickedPolyData[inPolyList])) {
				map.removeLayer(clickedPolyData[inPolyList]);
			}
			
			clickedPolyList.splice(inPolyList, 1);
			clickedPolyData.splice(inPolyList, 1);
		}
	}	

	setDownloadSelect();

	//console.log('clickedPolyList : '+  clickedPolyList );

 }
 
 function clearClickedPoly() {
	
	//console.log('clearClickedPoly : ' );	
	
	for (var i = 0; i < clickedPolyData.length; i++){
		
		if (map.hasLayer(clickedPolyData[i])) {
			map.removeLayer(clickedPolyData[i]);
		}
	}
	clickedPolyList.length = 0;
	clickedPolyData.length = 0;
	
	setDownloadSelect();
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

     $("#map").on("mousemove", function(e) {
         xNow = e.pageX;
         yNow = e.pageY;
     });

     $("#x-download").on("click", function(e) {
         $("#download_display_div").hide();
     });


     $("#download_select").on("change", function(e) {
         e.preventDefault();
         $("#warning-display").html("");
     });


    $( "#input-sac" ).autocomplete({
        source: function( request, response ) {
			var sac = request.term;
			//var urlAutoComp = geo_host +"/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&count=10&propertyName=sac&outputFormat="+ geo_output +"&sortBy=sac&cql_filter=sac+like+'" + sac + "%25'&format_options=callback:callbackAutoComp";
			var urlAutoComp = geo_host +"/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&count=10&propertyName=sac&outputFormat="+ geo_output +"&sortBy=sac&cql_filter=sac+like+'" + sac + "%25'";

			$.ajax({
				type: "GET",
				url: urlAutoComp,
				dataType: "json",
				//dataType: "jsonp",
				//jsonpCallback: "callbackAutoComp",
				success: function( data ) {
					var features = data.features;
					sac_list = [];
					for (var i = 0; i < features.length; i++) {
						sac_list.push(features[i].properties.sac);
					}

					response( sac_list );
				}
			});
        },
        minLength: 2,
        select: function( event, ui ) {
            setTimeout(function() {searchSAC();}, 200);
			//searchSAC();
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
		
		if (search == 'loc') {
			$("#input-sac").css('display', 'none');
			$("#span-sac-search").css('display', 'none');
			
			$("#input-location").css('display', 'block');
			$("#span-location-search").css('display', 'table-cell');
			$("#btn-label").text('Location');
        }
        else {
            $("#input-sac").css('display', 'block');
            $("#span-sac-search").css('display', 'table-cell');
			
            $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
            $("#btn-label").text('SAC');
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
    
 }
 
function searchedPoly(data){

	clearClickedPoly();

	//console.log('clickedPolyList.length : '+  clickedPolyList.length );	
	
	var sac = data.features[0].properties.sac;	
	codeNowSAC = sac;
	
	//console.log('codeNowSAC : ' +  codeNowSAC );
	
	var searchedPolyLayer = L.mapbox.featureLayer(data).setStyle(clickedPolyOption).addTo(map);
	
	searchedPolyLayer.on("click", function(e) {
		clickPoly(e);
	});		

	map.fitBounds(searchedPolyLayer.getBounds());		
	
	clickedPolyList.push(codeNowSAC);
	clickedPolyData.push(searchedPolyLayer);		
	
	setDownloadSelect();
}

function searchSAC() {

	var sac = $("#input-sac").val();
	//var urlSearch = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&maxFeatures=1&outputFormat="+ geo_output +"&cql_filter=sac="+ sac +"&format_options=callback:callbackSearch";
	var urlSearch = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sac&maxFeatures=1&outputFormat="+ geo_output +"&cql_filter=sac="+ sac +"";
	
	$.ajax({
		type: "GET",
		url: urlSearch,
		dataType: "json",
		//dataType: "jsonp",
		//jsonpCallback: "callbackSearch",
		success: function( data ) {			
			searchedPoly(data);			
		}
	});
}
 
 function locChange() {

     var loc = $("#input-location").val();
     geocoder.query(loc, codeMap);
 }

 function codeMap(err, data) {

     var lat = data.latlng[0];
     var lon = data.latlng[1];

     if (data.lbounds) {
         map.fitBounds(data.lbounds);
     } else if (data.latlng) {
         map.setView([lat, lon], 15);
     }
 }

 function showDownloadMenuBox() {
     $("#download-menu-box").show()
 }

 function hideDownloadMenuBox() {
     $("#download-menu-box").hide()
 }

 function showMapLegendBox() {
     $("#map-legend-box").show()
 }

 function hideMapLegendBox() {
     $("#map-legend-box").hide()
 }

 $(document).ready(function() {
     createMap();
     setListener();

     $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

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

function checkDownloadFeat() {
		
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator)) {
		//console.log('msSaveOrOpenBlob true ' );
		//console.log('checkDownloadFeat true');
		return true;
	}
	else {
	
		var a = document.createElement('a');
		if (typeof a.download != "undefined") {
			//console.log('checkDownloadFeat true');
			return true;
		}
		else {
			//console.log('checkDownloadFeat false');
			return false;
		}
	}
}
var checkDownload = checkDownloadFeat();

function downloadFile(e) {

    var dataType = e.target.id;
	
	var outputFormat, fileFormat;
    if (dataType == "shapefile") {
		outputFormat = "shape-zip";
		fileFormat = "zip";
	}
	else if (dataType == "geojson") {
		//outputFormat = "application/json";
		outputFormat = "json";
		fileFormat = "json";
	}	
	else if (dataType == "csv") {
		outputFormat = "csv";
		fileFormat = "csv";
	}
	else if (dataType == "gml") {
		outputFormat = "gml2";
		fileFormat = "gml";
	}
	else if (dataType == "kml") {
		outputFormat = "kml";
		fileFormat = "kml";
	}

    var selected = $('input[name=radio-areas]:checked').val();		
	var selVal = '';	
	var urlPoly, urlPoint 
	
    if (selected == "all") {
	
		selVal = 'all';
		
		urlPoly = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sa&maxFeatures=100000&outputFormat=" + outputFormat;		
		urlPoint = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_co&maxFeatures=100000&outputFormat=" + outputFormat;
    }
	else if (selected == "selected") {
        var sac_tuple = "(";
        for (var i = 0; i < clickedPolyList.length; i++){
            sac_tuple += "'" + clickedPolyList[i] + "',";
			
			if ((clickedPolyList[i] != '') && (clickedPolyList[i] != 'undefined')) {			
				if (selVal.length > 0) {
					selVal += '-';
				}
				selVal += clickedPolyList[i];
			}
        }

        sac_tuple = sac_tuple.replace(/,$/, "");
        sac_tuple += ")";	

        urlPoly = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_sa&maxFeatures=100000&outputFormat=" + outputFormat + "&cql_filter=sac+IN+" + sac_tuple;
        urlPoint = geo_host +"/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName="+ geo_space +":ror_co&maxFeatures=100000&outputFormat=" + outputFormat + "&cql_filter=sac+IN+" + sac_tuple;
    }	
	
	var zip = new JSZip();
	
	var statusPoly = false;
	var statusPoint = false;
	
	JSZipUtils.getBinaryContent(urlPoly, function (err, data) {
	
		//console.log('ror-map-poly');
		
	   if(err) {
		  //console.log('err poly : ' + err);
	   }   		   
	   zip.file("ror-map-"+ selVal +"-poly."+ fileFormat, data, {binary:true});
	   
		statusPoly = true;		   
		if (statusPoly && statusPoint) { 
			downloadZip();
		}
	   
	});
	
	JSZipUtils.getBinaryContent(urlPoint, function (err, data) {
	   
	   //console.log('ror-map-point');
	   
	   if(err) {
		  //console.log('err point : ' + err);
	   }   		   
	   zip.file("ror-map-"+ selVal +"-point." + fileFormat, data, {binary:true});
	   
		statusPoint = true;
		if (statusPoly && statusPoint) { 
			downloadZip();
		}	   
	});
	
	/*
	try {
		var isFileSaverSupported = !!new Blob;
		//console.log('isFileSaverSupported : ' + isFileSaverSupported );
		
	} catch (e) {
		//console.log('err isFileSaverSupported : ' + e);
	}
	*/	
	
	function downloadZip() {
		if ( (JSZip.support.blob) && (checkDownload) ) {			
			//console.log('ror-map-zip');			
			try {
				
				var zipName = "ror-map-"+ selVal +"-"+ dataType +".zip";
				var zipBlob = zip.generate({type:"blob"});
				
				saveAs(zipBlob, zipName);
				
			} 
			catch(e) {
				//console.log('err all : ' + e);
			}
			return false;				
		} 
		else {
			//console.log('not supported on this browser ' );			
			try {				
				//console.log('window popups');
				
				var windowPoly = window.open(urlPoly, "urlPoly", config = "toolbar=0");
				var windowPoint = window.open(urlPoint, "urlPoint", config = "toolbar=0");
				
				$('#download-zip-popup').show();			
			} 
			catch(e) {
				//console.log('err all : ' + e);
			}
		}
	}
}

function setDownloadSelect() {
    if (clickedPolyData.length == 0) {
        $('#all-areas').prop('checked',true);
        $('#selected-areas').prop('checked', false);
		
		$("#selected-areas-poly-id").html('');
    }
    else {
        $('#all-areas').prop('checked',false);
        $('#selected-areas').prop('checked', true);		
		
		clickedPolyListText = ''+ clickedPolyList;
		if (clickedPolyListText.length > 17) {
			clickedPolyListText = clickedPolyListText.substring(0,17) + '...';
		}		
		$("#selected-areas-poly-id").html('('+ clickedPolyListText +')');			
    }
}
