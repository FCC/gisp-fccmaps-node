(function(){
	
	var Coords = {},
			Demog = {},
			GMap = {};
	
	GMap = {		
		init: function () {
			var mapContainer = $( "#mapContainer" )[0],
					zipcode = $('#zipcode').val();
			
			map = new google.maps.Map(mapContainer, {
				disableDefaultUI: true,
				zoom: 11,
				center: new google.maps.LatLng(Coords.lat, Coords.long),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});	
			
			// Display address
			GMap.geocode_latlong();
			
			// Add a marker to the map
			GMap.addMarker(
				Coords.lat,
				Coords.long,
				"Initial Position"
			);		
						
		}, // End GMap.init
		addMarker: function ( latitude, longitude, label ){
			// Create the marker - this will automatically place it
			// on the existing Google map (that we pass-in).
			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(latitude, longitude),	
				title: (label || "")
			});
			 
			return( marker );
		},
		updateMarker: function ( marker, latitude, longitude, label ){
			// Update the position.
			marker.setPosition(new google.maps.LatLng(latitude, longitude));
			 
			// Update the title if it was provided.
			if (label) {				 
				marker.setTitle( label );				 
			}
		}, // End GMap.updateMarker
		geocode_latlong: function () {
			var latlng = new google.maps.LatLng(Coords.lat,Coords.long);
			
			// Reverse geocode lat, long to get address
			geocoder = new google.maps.Geocoder();
			// geocoder.geocode({ 'address': address }, function(results, status) {
			geocoder.geocode({ 'latLng': latlng }, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
			    /*map.setCenter(results[0].geometry.location);
			    var marker = new google.maps.Marker({
				    map: map,
				    position: results[0].geometry.location
				 	});*/
					
					$('#addr').text(results[0].formatted_address);
					$('#lat').text(Coords.lat);
					$('#long').text(Coords.long);
					//$('#pgTitle').text('LPFM Stations near ' + results[0].address_components[4].long_name);
				}
			});
		}, // End GMap.geocode_latlong
		geocode_zip: function (zip) {
			// Reverse geocode lat, long to get address
			geocoder = new google.maps.Geocoder();
			// geocoder.geocode({ 'address': address }, function(results, status) {
			geocoder.geocode({ 'address': zip }, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
			    /*map.setCenter(results[0].geometry.location);
			    var marker = new google.maps.Marker({
				    map: map,
				    position: results[0].geometry.location
				 	});*/
					
					Coords.lat = results[0].geometry.location.lat();
					Coords.long = results[0].geometry.location.lng();
					
					GMap.init();
					Demog.getData();				
				}
			});
		} // End GMap.geocode_zip
	} // End GMap
	
	Coords = {
		lat: null,
		long: null,
		getPos: function () {
				
				// If Zip Code box is empty, then get location automatically
				if ($('#zipcode').val() == '') {
					// Check if browser supports geolocation
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(
							function (position) {
								Coords.lat = position.coords.latitude;
								Coords.long = position.coords.longitude; 
								$('#lat').text(Coords.lat);
								$('#long').text(Coords.long);
								
								GMap.init();
								Demog.getData();
							},
							function (error) {
								alert('Unable to get current position');
							}
						);
					} else {
						alert('Your browser does not currently support geolocation.')	
					}		
				} else {
					var zip = $('#zipcode').val();
					GMap.geocode_zip(zip);
				}
				
				$('#btn-getCoords').click(function(e) {					
					var zip = $('#zipcode').val();
					e.preventDefault();					
					GMap.geocode_zip(zip);								
				});
				
				$('#zipcode').keyup(function(e){
					if (e.keyCode == 13) {
						$('#btn-getCoords').click();
					}
				});
				
				$('#lnk-curLoc').click(function(e){
					e.preventDefault();
					$('#zipcode').val('');
					location.reload();
				})
				
				
		}	// End Coords.getPos
	} // End Coords
	
	Demog = {
		getData: function () {

			//var url = 'http://www.broadbandmap.gov/broadbandmap/demographic/jun2011/coordinates?latitude=42.456&longitude=-74.987&format=jsonp&callback=?';
			var url = 'http://www.broadbandmap.gov/broadbandmap/demographic/jun2011/coordinates?latitude=' + Coords.lat + '&longitude=' + Coords.long + '&format=jsonp&callback=?',
					urlXML = 'http://www.broadbandmap.gov/broadbandmap/demographic/jun2011/coordinates?latitude=' + Coords.lat + '&longitude=' + Coords.long + '&format=xml',
					lpfmAPI = 'http://data.fcc.gov/lpfmapi/rest/v1/lat/' + Coords.lat + '/long/' + Coords.long + '?secondchannel=true&ifchannel=true&format=jsonp&callback=?';
				
			$('.api').attr('href', urlXML);
			
			// AJAX call to grab LPFM data
			$.getJSON(lpfmAPI, function (data) {	
					var chanfreq = data.interferringAnalysis,
							chanfreqLen = chanfreq.length ? chanfreq.length : 0,
							TR = '';
					
					// Populate Chan./Freq. table
					if (chanfreqLen > 1) {
						for (var i=0; i<chanfreqLen; i++) {
							TR += '<tr><td>' + chanfreq[i].channel	+ '</td><td>' + chanfreq[i].frequency	+ '</td></tr>';						
						}							
					} else {
							TR = '<tr><td>' + chanfreq.channel	+ '</td><td>' + chanfreq.frequency	+ '</td></tr>';						
					}
					
					
					$('#tbl-chanfreq').find('tbody').empty().append(TR);
			});
			
			// AJAX call to grab demographics data
			$.getJSON(url, function (data) {	
					if (data.status == "OK") {
						Demog.displayData(data);
					}	
			});
		}, // End Demog.getData
		displayData: function (d) {
				var dd = $('.lst-results').find('dd');
				
				// Populate Demographics info
				resultsArr = $.map(d.Results, function (val, i) {
					return val;					
				});
				
				dd.each(function(index){					
					if ((index == 1) || (index > 2)) {
						var val = (resultsArr[index] * 100).toFixed(2);
						
						$(this).text(val + '%');		
					} else {
						$(this).text(resultsArr[index]);	
					}					
				});
				
				// Populate Chan./Freq. table
				
		}
	} // End Demog
	

	Coords.getPos();

})();