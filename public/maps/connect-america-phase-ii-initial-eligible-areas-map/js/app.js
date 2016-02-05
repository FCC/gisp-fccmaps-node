var map;
var geocoder;

$(document).ready(function () {
	
	map = L.mapbox.map('map', 'fcc.map-kzt95hy6,fcc.pj3mobt9', { attributionControl: false,gridControl: false, maxZoom:10 })
            .setView([38.82, -94.96], 4);
	map.scrollWheelZoom.disable();

	var hash = L.hash(map);

	L.control.fullscreen().addTo(map);
	var activeLayerGroup = new L.LayerGroup();
	var cam411_TL = L.mapbox.tileLayer('fcc.h9d1v2t9')
					  .on('load',function(){ cam411_TL.removeEventListener(); })
	var cam411_GL = L.mapbox.gridLayer('fcc.h9d1v2t9');
	var cam411_GC = L.mapbox.gridControl(cam411_GL, { follow: true });
	var tileName = "cam411";

	activeLayerGroup.addLayer(cam411_TL);
	activeLayerGroup.addLayer(cam411_GL);
	activeLayerGroup.addLayer(cam411_GC);
	activeLayerGroup.addTo(map);

	var cam411_10_768_TL = L.mapbox.tileLayer('fcc.hjl40a4i');
	var cam411_10_768_GL = L.mapbox.gridLayer('fcc.hjl40a4i');
	var cam411_10_768_GC = L.mapbox.gridControl(cam411_10_768_GL, { follow: true });

	// Display the map data in the sidebar
	map.gridLayer.on('click',function(o) {
	  var data;
	  if (o.data != undefined) {
		 data = o.data;   
		// Populate location other stats (teaser fields from map)
		$('#stat-cnty').text(data.county_name);
		$('#stat-state').text(data.state);    
		$('#stat-tract').text(data.tract);
		// Additional Cost Stats (teaser fields from map)   
		$('#stat-pclocbtwn').text(data.pc_locations_between);
		$('#stat-pclocabv').text(data.pc_locations_above_ttc);
		$('#stat-pcannsup').text(formatComma(data.pc_annual_support));
		
		$('#download-county option[value=""]').prop('selected', true);
		$('#download-tract option[value=""]').prop('selected', true);
		$( '#download-geo' ).show();
	  } 
	  else { // Reset the text labels
		$('#stat-tract, #stat-cnty, #stat-pcannsup, #stat-pclocbtwn, #stat-pclocabv').text('---');
		$('#stat-state').text('--');
		//$('#dl-numLocs').find('span').text('-----'); 
		
		$('#download-county option[value=""]').prop('selected', true);
		$('#download-tract option[value=""]').prop('selected', true);
		$( '#download-geo' ).hide();
	  }
	});   
	
	// help text
	map.on('zoomend', function() {
		if (map.getZoom() >= 9) {
			$('#help-text').text("You can now click / touch tracts to display details.")
				.addClass('good');
			$('#map').addClass('pointer');
		} 
		else {
			$('#help-text').text("Zoom in to display tract level details on click / touch below.")
				.removeClass('good');			
			$('#map').removeClass('pointer');
		}
	});
   
	$( '#download-tract, #download-county' ).change(function() {
	
		var download_type = $(this).attr('id');		
		var output_format =  $( 'option:selected', this ).val();
		
		var tract_fips = $('#stat-tract').text();
		var county_fips = $('#stat-tract').text().substring(0,5);
	
		var cql_filter, file_name;	
		if (download_type == 'download-tract') {
			cql_filter = 'tract_fips=%27'+ tract_fips +'%27';
			file_name = '' + tract_fips +'.'+ output_format;
		}
		else if (download_type == 'download-county') {
			cql_filter = 'county_fips=%27'+ county_fips +'%27';
			file_name = '' + county_fips +'.'+ output_format;
		}
		//alert('cql_filter : ' + cql_filter );		
		//alert('file_name : ' + file_name );	
		
		if ((output_format != '') && ($.isNumeric(tract_fips))) {			
			
			if (output_format == 'kml') {
				window.open('http://www.broadbandmap.gov/geoserver/gis_swat/wms?service=WMS&version=1.1.0&request=GetMap&layers=gis_swat:caf2_geom&styles=&bbox=-180.0,-90.0,180.0,90.0&width=500&height=500&srs=EPSG:4326&format=kml&cql_filter='+ cql_filter);
			}
			else if (output_format == 'json') {
				window.open('http://www.broadbandmap.gov/geoserver/gis_swat/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gis_swat:caf2_geom&outputFormat='+ output_format +'&cql_filter='+ cql_filter, '_blank');
			} 
			else {
				window.open('http://www.broadbandmap.gov/geoserver/gis_swat/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gis_swat:caf2_geom&outputFormat='+ output_format +'&cql_filter='+ cql_filter);
			}		
			
			$('#download-county option[value=""]').prop('selected', true);
			$('#download-tract option[value=""]').prop('selected', true);
		}
	}); 	
	
	geocoder = L.mapbox.geocoder('fcc.map-kzt95hy6');	
		
	$('#geo-loc').change(function () {
		geoCode($(this).val());
	});
		
	$('#btn-geoLocation').click(function( event ) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var geo_lat = position.coords.latitude;
				var geo_lon = position.coords.longitude;
				var geo_acc = position.coords.accuracy;
				
				//reverseMap(geo_lat, geo_lon, geo_acc);
				//geocoder.reverseQuery([geo_lon, geo_lat], reverseMap);
				
				geoReverse(geo_lat, geo_lon);
				map.setView([geo_lat, geo_lon], 12);					
				
			}, function(error) {
				//alert('Error occurred. Error code: ' + error.code);    
				alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.'); 			
			},{timeout:4000});
		}
		else{
			alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.'); 	
		}
		
		return false;
	});
	
	function geoCode(loc) {
		geocoder.query(loc, codeMap);
	}
	function geoReverse(lat, lon) {		
		geocoder.reverseQuery([lon, lat], reverseMap);
	}
	
	function codeMap(err, data) {
		
		//alert(JSON.stringify(data));
		//alert(JSON.stringify(err));
		
		var lat = data.latlng[0];
		var lon = data.latlng[1];
	
		//map.setView([lat, lon], 15);	

		$("#geo-lat").val(lat);
		$("#geo-lon").val(lon);
		
		if (data.lbounds) {
			map.fitBounds(data.lbounds);
			
			marker.setLatLng(L.latLng(lat, lon));
			marker.addTo(map);	
		} 
		else if (data.latlng) {        
			map.setView([lat, lon], 15);	
			
			marker.setLatLng(L.latLng(lat, lon));
			marker.addTo(map);			
		}	
	}
	function reverseMap(err, data) {
		
		//alert('data : ' + JSON.stringify(data));
		
		var loc = $('#geo-loc').val();
		
		var lat = data.query[1];
		var lon = data.query[0];
		
		$("#geo-lat").val(lat);
		$("#geo-lon").val(lon);
		
		//map.setView([lat, lon], 15);		
		
		var name = '';
		var results_arr = data.results[0];
		
		for (i = 0; i < results_arr.length; i++) {
			if (results_arr[i]['type'] == 'city') {
				name = results_arr[i]['name'];
			}
			else if (results_arr[i]['type'] == 'province') {
				if (results_arr[i]['name'] == 'District of Columbia') {
					name += ', DC';
				}
				else {
					name += ', ' + results_arr[i]['name'];
				}
			}
		}
		
		if ((name.length > 0) && (name != '') && (loc == '')) {
			$('#geo-loc').val(name);
		}
		
		//map.setView([lat, lon], 14);
		map.setView([lat, lon]);
		
		marker.setLatLng(L.latLng(lat, lon));
		marker.addTo(map);			
	}
	
});

  

// Format dummy data with commas
function formatComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} 