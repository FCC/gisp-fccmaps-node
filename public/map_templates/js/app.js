var map;
	var layerList = [];
	var mapLayers = [];
	var mapOptions;
	var map_info;
	var layers_info;
	
	
	function createMap() {
	
	
	var initialzoom = 5;
	var maxzoom = 15;
	var minzoom = 3;
	var center_lat = 50;
	var center_lon = -105;
	if (map_info.mapzoom) {
		if (map_info.mapzoom.initialzoom) {
			initialzoom = map_info.mapzoom.initialzoom;
		}
		if (map_info.mapzoom.maxzoom) {
			maxzoom = map_info.mapzoom.maxzoom;
		}
		if (map_info.mapzoom.minzoom) {
			minzoom = map_info.mapzoom.minzoom;
		}
	}
	if (map_info.mapcenter) {
		if (map_info.mapcenter.center_latitude) {
			center_lat = map_info.mapcenter.latitude;
		}
		if (map_info.mapcenter.center_longitude) {
			center_lon = map_info.mapcenter.longitude;
		}
	}

	
	console.log(initialzoom + ' ' + maxzoom + ' ' + minzoom + ' ' + center_lat + ' ' + center_lon);
	
	
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
     map = L.mapbox.map('map-container', 'fcc.k74ed5ge', {
             attributionControl: true,
             maxZoom: maxzoom,
			 minZoom: minzoom
         })
         .setView([center_lat, center_lon], initialzoom);
		
	if (map_info.attribution) {
		map.attributionControl.addAttribution(map_info.attribution);
	}

 
	var zindex1 = 10;
	for (var i = 0; i < layers_info.length; i++) {
		zindex1++;
		console.log(layers_info[i]);
		if (layers_info[i].layertype == "mapbox") {
			if (layers_info[i].checked == "yes") {
				mapLayers.push(L.mapbox.tileLayer(layers_info[i].mapid).setZIndex(zindex1).addTo(map));
			}
			else {
				mapLayers.push(L.mapbox.tileLayer(layers_info[i].mapid).setZIndex(zindex1));
			}
			console.log("layer " + i);
		}
		else if (layers_info[i].layertype == "geoserver") {
			console.log("layer " + i);
			if (layers_info[i].checked == "yes") {
				mapLayers.push(L.tileLayer.wms(layers_info[i].geohost + '/geoserver/wms', {
					format: 'image/png',
					transparent: true,
					layers: layers_info[i].layername,
					styles: layers_info[i].style
				}).setZIndex(zindex1).addTo(map));
			}
			else {
				mapLayers.push(L.tileLayer.wms(layers_info[i].geohost + '/geoserver/wms', {
					format: 'image/png',
					transparent: true,
					layers: layers_info[i].layername,
					styles: layers_info[i].style
				}).setZIndex(zindex1));
			}
		
		}
	}
		 
	console.log(map_info);
	baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge');
	baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
	baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');
	var baseLayer = {};
	for (var i = 0; i < map_info.basemap.length; i++) {
		if (i == 0) {
			if (map_info.basemap[i] == "street") {
				baseLayer["Street"] = baseStreet.addTo(map);
			}
			else if (map_info.basemap[i] == "satellite") {
				baseLayer["Satellite"] = baseSatellite.addTo(map);
			}
			else if (map_info.basemap[i] == "terrain") {
				baseLayer["Terrain"] = baseTerrain.addTo(map);
			}
		}
		else {
			if (map_info.basemap[i] == "street") {
				baseLayer["Street"] = baseStreet;
			}
			else if (map_info.basemap[i] == "satellite") {
				baseLayer["Satellite"] = baseSatellite;
			}
			else if (map_info.basemap[i] == "terrain") {
				baseLayer["Terrain"] = baseTerrain;
			}
		
		}
		
	}
	
	
	layerControl = new L.Control.Layers(
		baseLayer,
     {

     }, {
		position: 'topleft'
	 }
	 ).addTo(map);
		
	
	if (map_info.scalecontrol == "yes") {
		 L.control.scale({
			 position: 'bottomright'
		 }).addTo(map);
	 }

     geocoder = L.mapbox.geocoder('mapbox.places-v1');
	 
	 //make legend
	 if (layers_info.length > 0) {
		 var legend_text1 = "";
		 for (var i = 0; i < layers_info.length; i++) {
			legend_text1 += '<tr><td><input type="checkbox" id="' + i + '" class="checkbox-provider" checked>&nbsp;</td><td style="width: 28px; height: 28px;"><div style="width: 20px; height: 20px; background-color:' + layers_info[i].legendcolor + '; opacity: 1.0; border: solid 1px #999999"></div></td><td>' +  layers_info[i].legendtext + '</td></tr>' + "\n";

		 }
		 
		 var legend_text =	'<div id="div-legend" style="position: absolute; bottom: 10px; left: 10px; background-color: #FFFFFF; border: solid 1px #999999; z-index: 2; visibility: visible: none">' +
				'<table style="margin: 5px">' +
				'<tr><td colspan=3>' +
                 '<span class="icon icon-bars"></span> <span class="map-legend-name">Map Legend</span>' +
								'<button class="btn-closeLegend btn btn-xs pull-right">' +
									'<span class="icon icon-close"></span> <span class="sr-only">Hide legend</span>' +
								'</button>' +
				'</td></tr>' +
				legend_text1 +
				'</table>' +
			'</div>' +
			'<div id="div-legend-icon"  style="position: absolute; bottom: 10px; left: 10px;z-index: 1; cursor: pointer;" title="Map Legend">' +
			'<span class="icon icon-bars"></span>' +
			'</div>';
	 	 console.log(legend_text);
		 $('#div-legend-holder').html(legend_text);
	 }
	 
	}
	
	
	function createSearchFields() {
	
		console.log(map_info.search);
	
		if (map_info.search && map_info.search.toLowerCase() == "no") {
			$('#search-field-holder').css("display", "none");
			return;
		}
		
		if (map_info.search && map_info.search.toLowerCase() == "yes") {
			$('#search-field-holder').css("display", "block");
			return;
		}

	}
	
	function createSearchFields1() {
	
		if (map_info.search && map_info.search.length == 0) {
			$('#search-field-holder').html(field_text).css("display", "none");
			return;
		}
		
		if (map_info.search && map_info.search.length > 0) {
			var hasAddress = false;
			for (var i = 0; i < map_info.search.length; i++) {
				if (map_info.search[i] == "address") {
					hasAddress = true;
				}
			}
			if (!hasAddress) {
				return;
			}
		}
	
	

		if (map_info.search && map_info.search.length > 0) {
		
			var field_dropdown = "";
			for (var i = 0; i < map_info.search.length; i++) {
				if (map_info.search[i] == "address") {
					field_dropdown += '<li><a href="#" data-value="loc">Address</a></li>';
				}
				if (map_info.search[i] == "coordinate") {
					field_dropdown += '<li><a href="#" data-value="latlon-decimal">Coordinates</a></li>';
				}
			
			}
			
			console.log(field_dropdown)

			var field_text = 	'<div id="search-field" class="input-group" style="width: 920px"> \
							<div class="search-group"> \
								<div class="search-input"> \
									<div class="input-group"> \
										<div class="input-group-btn"> \
											<button aria-expanded="false" data-toggle="dropdown" class="btn btn-default dropdown-toggle" type="button"><span id="btn-label">Address</span> <span class="caret"></span></button> \
											<ul id="input-search-switch" role="menu" class="dropdown-menu">' +
											field_dropdown +				
							 '</ul> \
							</div>';
						
			for (var i = 0; i < map_info.search.length; i++) {
				if (map_info.search[i] == "address") {
					field_text += '<input id="input-location" class="form-control" type="search" placeholder="Enter Address" style="display: block">';			
				}
				if (map_info.search[i] == "coordinate") {
					field_text += '<div id="input-latlon-decimal" class="form-control" type="search" placeholder="Enter Latlon decimal" style="display: none"> \
										<table id="table-latlon-decimal"><tr> \
										<td>Latitude: <input id="latitude"   placeholder="41.234567" style="width: 150px; height: 20px; border: solid 1px #eee"></td> \
										<td width=75></td> \
										<td>Longitude: <input id="longitude"   placeholder="-91.234567" style="width: 150px; height: 20px; border: solid 1px #eee"></td> \
										</tr></table> \
										</div>';		
				}
			}
			
			field_text += 	'<span class="input-group-btn" id="span-location-search" style="display: table-cell"> \
											<button class="btn-search btn btn-default" type="submit" id="input-loc-search" title="Location Search" data-toggle="tooltip" data-placement="top"><span class="glyphicon glyphicon-search"></span><span class="sr-only">Location Search</span></button> \
										</span> \
										<span class="input-group-btn" id="span-latlon-decimal-search" style="display: none"> \
											<button class="btn-search btn btn-default" id="input-latlon-decimal-search" title="Decimal Latlon Search" data-toggle="tooltip" data-placement="top"><span class="glyphicon glyphicon-search"></span><span class="sr-only">Decimal Lat/Lon Search</span></button> \
										</span> \
										</div> \
								</div> \
								<div class="btn-group-loc"> \
									<span class="input-group-btn"> \
										<button class="btn-geoLocation btn btn-default st" title="Get Current Location" data-toggle="tooltip" data-placement="top" id="btn-geoLocation" type="button" data-original-title="Get Current Location"> \
										<span class="fa fa-location-arrow"></span><span class="sr-only">Get Current Location</span></button> \
									<button class="btn-nationLocation btn btn-default st" title="Nationwide" data-toggle="tooltip" data-placement="top" id="btn-nationLocation" type="button" data-original-title="Nationwide"><span class="icon-nation-1"></span><span class="sr-only">Nationwide</span></button> \
									</span> \
								</div> \
							</div> \
						</div>';

			
			$('#search-field-holder').html(field_text).css("display", "block");
			
		}
		

	}
	
	function activateAllLegends() {
		for (var i = 0; i < layers_info.length; i++) {
		console.log(i)
					console.log(layers_info[i].checked)
			if (layers_info[i].checked == "yes") {

				$('#' + i).prop('checked', true);
			}
			else {
				$('#' + i).prop('checked', false);
			}
		}
	}
	
	
	function searchLocation() {
		locChange();
	}
	
	function locChange() {
	var loc = $("#input-location").val();
	geocoder.query(loc, codeMap);
	
	function codeMap(err, data) {

	if (data.results.features.length == 0) {
		alert("No results found");
		return;
	}
	var lat = data.latlng[0];
	var lon = data.latlng[1];
	
	map.setView([lat, lon], 14);

	}
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

	map.setView([lat, lon], 14);
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

	map.setView([lat, lon], 14);

	} 
	
	
	
	
	function setupListener() {
		$('.checkbox-provider').on("click", function(e) {
			var id = e.target.id;
			var i = parseInt(id);

			if($('#' + id).prop('checked')) {
			//remove layer
			if (map.hasLayer(mapLayers[i])) {
			map.removeLayer(mapLayers[i]);
			}
			//add layer
			mapLayers[i].addTo(map);
			}
			else {
			//remove layer
			if (map.hasLayer(mapLayers[i])) {
			map.removeLayer(mapLayers[i]);
			}
			}
		});
		
		$('.btn-closeLegend').on("click", function(e) {
			$//hide legend
			$('#div-legend').css("visibility", "hidden");
		});
		
		$('#div-legend-icon').on("click", function(e) {
		$//show legend
		$('#div-legend').css("visibility", "visible");
		
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

				map.setView([geo_lat, geo_lon], 14);

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
		 map.setView([50, -105], 3);
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
	
	
	function updateMapSize() {
		if (map_info.mapwidth) {
		console.log(map_info.mapwidth);
			$('#search-field').css("width", map_info.mapwidth);
			$('#map-holder').css("width", map_info.mapwidth);
			//$('#map').css("width", map_info.mapwidth);
			console.log("changed");
		}
		if (map_info.mapheight) {
			$('#map-holder').css("height", map_info.mapheight);
			$('#map').css("height", map_info.mapheight);
			console.log("h changed");
		}
		
		document.title = map_info.title;
	
	}
	
	function getMapInfo() {
		map_info = mapOptions.fields.field_description.und[0].value;
		console.log(map_info);
		
		map_info = JSON.parse(map_info);
		layers_info = map_info.layers;
	}
	
	function updateText() {

		var json_obj = JSON.parse(mapOptions.fields.field_description.und[0].value);
		var bureau = "NA"
		if (json_obj.bureau) {
			bureau = json_obj.bureau;
		}
		var title = mapOptions.title;
		var subtitle = mapOptions.fields.field_subtitle.und[0].value;
		var created = mapOptions.created;
		var changed = mapOptions.changed;
			console.log('update subtitle ' + subtitle)
		$(document).prop('title', title);
		$('#span-title').html(title);
		$('#span-subtitle').html(subtitle);
		$('#dd-published').html(created);
		$('#dd-updated').html(changed);
		$('#span-bureau').html(bureau);
		
		map_info = mapOptions.fields.field_description.und[0].value;
		map_info = JSON.parse(map_info);
		var description = map_info.description;
		$('#span-description').html(description);
	}
	
	
	function updateMapList() {
		var url = "/getExistingMaps";
		$.ajax(url, {
			type: "GET",
			url: url,
			dataType: "json",
			success: function(data){
				var urls = data.urls;
				var titles = data.titles;
				var map_list_text = "";
				for (var i = 0; i < urls.length; i++) {
					map_list_text += '<li><a href="/' + urls[i] + '" class=""> \
					<iframe width="150" height="125" src="/' + urls[i] + '/responsive.html"></iframe> \
					<p>' + titles[i] + '</p> \
					</a></li>';
				}
				
				console.log(map_list_text)
				$('#ul-map-list').html(map_list_text);
			
			}
		});
	
	
	}
	
	
	$(document).ready(function() {
		getMapInfo();
		//updateMapSize();
		updateMapList();
		updateText();
		createMap();
		createSearchFields();
		setupListener();
		activateAllLegends();
		
	});