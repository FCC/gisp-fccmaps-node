(function ($) {

    "use strict";
	var mapType;
    
    // Define map layers
    var mapLayers = {
        
        //congrDist_TL: L.mapbox.tileLayer('computech.hj38elg7'),
        //congrDist_GL: L.mapbox.gridLayer('computech.hj38elg7'),
        //cnty_TL: L.mapbox.tileLayer('computech.hj2ghocl'),
        //cnty_GL: L.mapbox.gridLayer('computech.hj2ghocl'),
        //schoolDist_TL: L.mapbox.tileLayer('computech.hin0bi84'),
        //schoolDist_GL: L.mapbox.gridLayer('computech.hin0bi84')        
		schoolDist_TL: L.mapbox.tileLayer('fcc.a23uwhfr'),
        schoolDist_GL: L.mapbox.gridLayer('fcc.a23uwhfr'),
		library_TL: L.mapbox.tileLayer('fcc.9gmpwrk9'),
        library_GL: L.mapbox.gridLayer('fcc.9gmpwrk9'),
        //cnty_TL: L.mapbox.tileLayer('fcc.a23uwhfr'),
        //cnty_GL: L.mapbox.gridLayer('fcc.a23uwhfr'),

        base_TL: L.mapbox.tileLayer('fcc.map-kzt95hy6')
    },
        eRateMap = {
			hash: null,
            activeLayerGroup: null,
			init: function () {
                var defLat = 38.82,
                    defLon = -94.96,
                    defZoom = 4;
                                 
                var map = L.mapbox.map('map', null, {minZoom: 3, maxZoom: 10, zoom: defZoom});              
				//	.setView([defLat, defLon], defZoom);

                map.addLayer(mapLayers['base_TL']);

                this.hash = L.hash(map, defLat, defLon, defZoom);

                //L.control.fullscreen().addTo(map);
                //L.control.attribution({position: 'bottomleft'}).setPrefix(image).addTo(map);
                map.scrollWheelZoom.disable();

                // get url hash and set layers
                var urlHash = window.location.hash;                
				var urlLayer = "schoolDist";
                
                if (urlHash.indexOf('#') === 0) {
                    urlHash = urlHash.substr(1);
                }
                var args = urlHash.split("/");					
			
                if (args.length >= 4) {					
					if ((args[3] == "congrDist") || (args[3] == "cnty") || (args[3] == "schoolDist") || (args[3] == "library")) {
						urlLayer = args[3];
					}
                }
				mapType = urlLayer;
								
                var urlTile = mapLayers[urlLayer + '_TL'];
				var urlGrid = mapLayers[urlLayer + '_GL'];
								
                this.activeLayerGroup = new L.LayerGroup();
                this.addLayers(map, urlTile, urlGrid);  
				
				this.hash.setLayer(urlLayer);
				
                $('.list-layerSwitch').find('.active').removeClass('active');
                $('#' + urlLayer).addClass('active');

                $('#content-main').find('.map-desc').addClass('hide');
                $('#desc-' + urlLayer).removeClass('hide');
				
				$('#content-main').find('.map-stats').addClass('hide');
                $('#stats-' + urlLayer).removeClass('hide'); 

                // onclick for layerSwitch
                $('.list-layerSwitch').on('click', 'li', {
                    map: map, 
                    hash: this.hash,
                }, eRateMap.switchLayer);
            },
            addLayers: function (map, layer_TL, layer_GL) {
                eRateMap.activeLayerGroup.addLayer(layer_TL);
                eRateMap.activeLayerGroup.addLayer(layer_GL);      

                //eRateMap.activeLayerGroup.addLayer(congrDist_GC);
                eRateMap.activeLayerGroup.addTo(map);                
               	L.mapbox.gridControl(layer_GL.on('mouseover', eRateMap.getMapData));
				L.mapbox.gridControl(layer_GL.on('click', eRateMap.getMapData));			
            },
            switchLayer: function (event) {

                var targetID = event.target.id;
                var tile_TL = mapLayers[targetID + '_TL'];
                var tile_GL = mapLayers[targetID + '_GL'];
				//var mapDesc = event.target.getAttribute('href');
				mapType = targetID;

                event.preventDefault();
				
                eRateMap.clearMapData();
                eRateMap.activeLayerGroup.clearLayers();
                eRateMap.addLayers(event.data.map, tile_TL, tile_GL);

                event.data.hash.setLayer(targetID);
				event.data.hash.updateHash();

                $('.list-layerSwitch').find('.active').removeClass('active');
                $('#' + targetID).addClass('active');

                // Show map description
                $('#content-main').find('.map-desc').addClass('hide');
                $('#desc-' + targetID).removeClass('hide');
				
				$('#content-main').find('.map-stats').addClass('hide');
                $('#stats-' + targetID).removeClass('hide');
            },
            getMapData: function (o) {                
                
                var data;

                function toTitleCase(str) {
                    str = str.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                        return letter.toUpperCase();
                    });

                    return str;
                }

                function numberWithCommas(x) {
                    var parts = x.toString().split(".");
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    return parts.join(".");
                }
				
				function isDefined (v) {
					return typeof v !== "undefined"; 	
				} 

                if (isDefined(o.data)) {
                    data = o.data;					
					//alert('data : ' +  JSON.stringify(data) );

                    // Populate stats
					if (mapType == "schoolDist") {
						var geoDesc = isDefined(data.uni_district_name) ? data.uni_district_name : '';
						var elDistrict = isDefined(data.el_district_name) ? data.el_district_name : '';
						var secDistrict = isDefined(data.sec_district_name) ? '<br>' + data.sec_district_name : '';
						var tot_students = isDefined(data.tot_students) ? data.tot_students : '';
						var pct_fiber_true = isDefined(data.pct_fiber_true) ? data.pct_fiber_true : 0;
						var pct_fiber_false = isDefined(data.pct_fiber_false) ? data.pct_fiber_false : 0;
						var pct_fiber_null = isDefined(data.pct_fiber_null) ? data.pct_fiber_null : 0;
						
						$('#stat-geoDesc').html(geoDesc + elDistrict + secDistrict);
						$('#stat-totStudents').text(numberWithCommas(tot_students));
						$('#stat-pctFiberTrue').text(pct_fiber_true + '%');
						$('#stat-pctFiberFalse').text(pct_fiber_false + '%');
						$('#stat-pctFiberNull').text(pct_fiber_null + '%');
					}
					else if (mapType == "library") {
						var libaryName = isDefined(data.libname) ? data.libname : '';
						var libraryPopulation = isDefined(data.visits) ? data.visits : '';
						var librarySystemName = isDefined(data.system_name) ? data.system_name : '';
						var libraryType = isDefined(data.lib_type) ? data.lib_type : '';
						
						if (libraryType == 'CE') {
							libraryType = 'Central';
						}
						else if (libraryType == 'BR') {
							libraryType = 'Branch';
						}
						
						$('#stat-libraryName').html(toTitleCase(libaryName));
						$('#stat-libraryPopulation').text(numberWithCommas(libraryPopulation));	
						$('#stat-librarySystemName').html(toTitleCase(librarySystemName));
						$('#stat-libraryType').html(toTitleCase(libraryType));
					}

                } else {
                    eRateMap.clearMapData();
                }
            },
            clearMapData: function () {
                $('#stat-state').text('--');
                $('.dl-stats').find('span').text('----');
            }
        };

    eRateMap.init();

} (jQuery));
