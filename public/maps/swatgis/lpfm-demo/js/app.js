(function(){
	
	var Coords = {},
			Demog = {},
			MapBox = {};
	
	MapBox = {		
		init: function () {
			var mapContainer = $( "#mapContainer" )[0],
					zipcode = $('#zipcode').val();
			var boundArray=[];
			var mapBoxURL = 'http://api.tiles.mapbox.com/v3/fcc.map-rons6wgv/geocode/' + Coords.long + ',' + Coords.lat + '.json';
			
			
			$.getJSON(mapBoxURL, function (value) {
			
				if (value.results.length==0) {			        	 
			        	 alert("We could not verify this is a valid zip code.");
			         } 
			         else {
				    	result = value.results[0][0];
				    	lat = result.lat;
				        	lon = result.lon;
				        	resultType = result.type;
				        	boundArray.push(parseFloat(result.bounds[1]));
				        	boundArray.push(parseFloat(result.bounds[3]));
				        	boundArray.push(parseFloat(result.bounds[0]));
				        	boundArray.push(parseFloat(result.bounds[2]));
		       				zoom=12;

		       				mapSrc="<img src='http://api.tiles.mapbox.com/v3/fcc.map-rons6wgv/pin-m-x+48C("+
		   							lon + "," + lat + ")/" + lon + "," + lat + "," +zoom + "/290x150.png'/>";
		   							
		   					$('#mapContainer').empty();
		   					$('#mapContainer').html(mapSrc);  	
				    	}
			});
			
			$('#lat').text(Coords.lat);
					$('#long').text(Coords.long);
						
		}, // End MapBox.init
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
		}, // End MapBox.updateMarker
		geocode_latlong: function () {
			var latlng = new google.maps.LatLng(Coords.lat,Coords.long);
			
			// Reverse geocode lat, long to get address
			geocoder = new google.maps.Geocoder();
			// geocoder.geocode({ 'address': address }, function(results, status) {
			geocoder.geocode({ 'latLng': latlng }, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
					
					$('#addr').text(results[0].formatted_address);
					$('#lat').text(Coords.lat);
					$('#long').text(Coords.long);
				}
			});
		}, // End MapBox.geocode_latlong
		geocode_zip: function (zip) {
			// Reverse geocode lat, long to get address
			geocoder = new google.maps.Geocoder();
			// geocoder.geocode({ 'address': address }, function(results, status) {
			geocoder.geocode({ 'address': zip }, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
				
					Coords.lat = results[0].geometry.location.lat();
					Coords.long = results[0].geometry.location.lng();
					
					MapBox.init();
					Demog.getData();				
				}
			});
		} // End MapBox.geocode_zip
	} // End MapBox
	
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
								
								MapBox.init();
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
					MapBox.geocode_zip(zip);
				}
				
				$('#btn-getCoords').click(function(e) {					
					var zip = $('#zipcode').val();
					e.preventDefault();					
					MapBox.geocode_zip(zip);								
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

			var url = 'http://www.broadbandmap.gov/broadbandmap/demographic/jun2011/coordinates?latitude=' + Coords.lat + '&longitude=' + Coords.long + '&format=jsonp&callback=?',
					urlXML = 'http://www.broadbandmap.gov/broadbandmap/demographic/jun2011/coordinates?latitude=' + Coords.lat + '&longitude=' + Coords.long + '&format=xml',
					lpfmAPI = 'http://data.fcc.gov/lpfmapi/rest/v1/lat/' + Coords.lat + '/long/' + Coords.long + '?secondchannel=true&ifchannel=true&format=jsonp&callback=?';
		
			$('.api').attr('href', urlXML);
			
			// AJAX call to grab LPFM data
			$.getJSON(lpfmAPI, function (data) {	
					var chanfreq = data.interferingAnalysis,
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
					
					
					$('#tbl-chanfreq').show().find('tbody').empty().append(TR);
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
				
			
				
		}
	} // End Demog
	

	Coords.getPos();

})();