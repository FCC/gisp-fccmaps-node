(function () {

    var FCCMap = {},
    CRWidget = {};

    FCCMap = {
				map: undefined,
				boundArray: [],
				geoServerURL: "http://165.135.239.37:8010/geoserver/",
        init: function () {

            var layers = [];
            var coverageLayers = [];
            
            var mapservice_count = 5;
            var mapExtent;
            var fullExtent = new OpenLayers.Bounds(-17107255, 2910721, -4740355, 6335100);
            //var colorArray = ['#D7191C', '#FDAE61', '#FFFFBF', '#ABDDA4', '#2B83BA'];
            var selectedID = [],
                selectedLayers = [],
                selectedObj = [];

            // pink tile avoidance
            OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
            // make OL compute scale according to WMS spec
            OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

            var map = new OpenLayers.Map({
                div: "map",
                projection: "EPSG:900913",
                displayProjection: "EPSG:4326",
                numZoomLevels: 14,
                maxExtent: new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7),
                units: "meters"
            });


            var mapboxTerrain = new OpenLayers.Layer.XYZ(
                "Mapbox Terrain map", [
            //  "https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"
            "http://a.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
                "http://b.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
                "http://c.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
                "http://d.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"], {
                attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " + "and contributors, CC-BY-SA",
                sphericalMercator: true,
                wrapDateLine: true,
                numZoomLevels: 14,
                transitionEffect: "resize",
                buffer: 1
            });
            var stamenToner = new OpenLayers.Layer.XYZ(
                "Stamen Toner map", [
                "http://a.tile.stamen.com/toner/${z}/${x}/${y}.png",
                "http://b.tile.stamen.com/toner/${z}/${x}/${y}.png",
                "http://c.tile.stamen.com/toner/${z}/${x}/${y}.png",
                "http://d.tile.stamen.com/toner/${z}/${x}/${y}.png"], {
                attribution: "Map tiles by <a target='_top' href='http://stamen.com'>Stamen Design</a>, under " + "<a target='_top' href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by " + "<a target='_top' href='http://openstreetmap.org'>OpenStreetMap</a>, under " + "<a target='_top' href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>",
                sphericalMercator: true,
                wrapDateLine: true,
                numZoomLevels: 17,
                transitionEffect: "resize",
                buffer: 1
            });
            var mapboxNightvision = new OpenLayers.Layer.XYZ(
                "Mapbox Nightvision map", [
            //"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-qly54czi/${z}/${x}/${y}.png"
            "http://a.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
                "http://b.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
                "http://c.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
                "http://d.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png"

            ], {
                attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " + "and contributors, CC-BY-SA",
                sphericalMercator: true,
                wrapDateLine: true,
                numZoomLevels: 14,
                transitionEffect: "resize",
                buffer: 1
            });
            var mapboxLight = new OpenLayers.Layer.XYZ(
                "Mapbox Light map", [
            //"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
            "http://a.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
                "http://b.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
                "http://c.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
                "http://d.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"], {
                attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " + "and contributors, CC-BY-SA",
                sphericalMercator: true,
                wrapDateLine: true,
                numZoomLevels: 14,
                transitionEffect: "resize",
                buffer: 1
            });
            var mapboxSatellite = new OpenLayers.Layer.XYZ(
                "Mapbox Satellite map", [
            //"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
            "http://a.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
                "http://b.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
                "http://c.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
                "http://d.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png"], {
                attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " + "and contributors, CC-BY-SA",
                sphericalMercator: true,
                wrapDateLine: true,
                numZoomLevels: 14,
                transitionEffect: "resize",
                buffer: 1
            });

            layers.push(mapboxTerrain);
            layers.push(stamenToner);
            layers.push(mapboxNightvision);
            layers.push(mapboxLight);
            layers.push(mapboxSatellite);
            map.addLayers(layers);

            map.zoomToExtent(fullExtent);
            map.zoomTo(4);
						
						FCCMap.map = map;

            // Map layer switch control
            $('#map-layerSwitch').find('a').click(function () {

                if (this.id == "mapboxTerrain") {
                    map.setBaseLayer(mapboxTerrain);
                } else if (this.id == "stamenToner") {
                    map.setBaseLayer(stamenToner);
                } else if (this.id == "mapboxNightvision") {
                    map.setBaseLayer(mapboxNightvision);
                } else if (this.id == "mapboxLight") {
                    map.setBaseLayer(mapboxLight);
                } else if (this.id == "mapboxSatellite") {
                    map.setBaseLayer(mapboxSatellite);
                }
                $('#map-layerSwitch').find('a').removeClass('active');
                $(this).addClass('active');
            });

            $('#btn-resetMap').click(function () {
                map.zoomToExtent(mapExtent);
            });

            $('#btn-apply').click(function () {
                CRWidget.drawMap();
            })
        } // end FCCMap.init		


    } // end FCCMap

    CRWidget = {
        propData: undefined,
				coverageLayers: [],
        selectedID: [],
				colorArray: ['#D7191C','#FDAE61','#FFFFBF','#ABDDA4','#2B83BA'],
        getData: function () {
            $.getJSON("data/coverageRigh201210_2.json", function (data) {

                var propDataLen = 0,
                    propLen = 0,
                    lstItem = '';

                CRWidget.propData = data;
                propDataLen = CRWidget.propData.length;

                // populate list of companies

                for (var i = 0; i < propDataLen; i++) {
                    var propLen = data[i].property.length,
                        optgroup = $('<optgroup>');

                    optgroup.attr('label', data[i].techType);

                    for (var j = 0; j < propLen; j++) {
                        var option = $("<option></option>");
                        option.val(data[i].property[j].id);
                        option.text(data[i].property[j].companyName);
                        optgroup.append(option);
                    }
                    $("#boundarySelect").append(optgroup);
                }

                $("#boundarySelect").chosen({
                    max_selected_options: 5
                });

                $("#boundarySelect").chosen().change(function () {
                    CRWidget.selectedID = [];
                    CRWidget.selectedID = $("#boundarySelect").val();
                });



            });
        }, //end CRWidget.getData
        updateCoverageLayers: function (cLayers) {
            //map.zoomToExtent(fullExtent);
            //map.zoomTo(4);
            FCCMap.boundArray = [];
            CRWidget.getLayersBound(cLayers);
            if (CRWidget.coverageLayers.length > 0) {
                for (var x = 0; x < CRWidget.coverageLayers.length; x++) {
                    map.removeLayer(CRWidget.coverageLayers[x]);
                }
            }
            var mLayers = [];
            CRWidget.coverageLayers = [];
            for (var i = 0; i < cLayers.length; i++) {
                var obj = new Object();
                obj["mLayer_" + i] = new OpenLayers.Layer.WMS(
                    "mLayer_" + i, FCCMap.geoServerURL + "coverageright201010/wms", {
                    layers: 'coverageright201010:' + cLayers[i].serviceName, //Bluegrass_Cellular_1X', 
                    format: 'image/png',
                    sldBody: CRWidget.getSLDBody(cLayers[i].serviceName, i),
                    isBaseLayer: false,
                    transparent: true
                }, {
                    //singletile:true, 
                    //ratio:1,
                    tiled: true,
                    tileOptions: {
                        maxGetUrlLength: 2048
                    },
                    transitionEffect: 'resize'
                });
                mLayers.push(obj);
            }
            for (var j = 0; j < cLayers.length; j++) {
               CRWidget. coverageLayers.push(mLayers[j]["mLayer_" + j]);
            }
            FCCMap.map.addLayers(CRWidget.coverageLayers);
            for (var x = 0; x < CRWidget.coverageLayers.length; x++) {
                CRWidget.coverageLayers[x].redraw();
            }
            this.createServiceList(cLayers);

        }, // End CRWidget.updateCoverageLayers()
        createServiceList: function (cLayers) {

            var chkBoxes = $('#sel-boundary').find('input[type="checkbox"]').not(':checked'),
                chkedBoxes = $('#sel-boundary').find('input[type="checkbox"]:checked').length,
                TD = '';

            if (chkedBoxes >= 5) {
                chkBoxes.attr('disabled', true);
            } else {
                chkBoxes.removeAttr('disabled');
            }

            for (var i = 0; i < cLayers.length; i++) {
                TD += '<td><input id=' + cLayers[i].id + ' type="checkbox" checked onclick="handleVisibility(' + cLayers[i].id + ');">' + "</td>";
                content += '<td><div style="width:40px;height:20px;background-color:' + CRWidget.colorArray[i] + ';"></div></td>';
                content += "<td>" + cLayers[i].companyName + "</td>";
                content += "<td>" + cLayers[i].techType + "</td>";
                content += '<td><a class="lnk-toggle" style="float:left" href="#" onclick="zoomToBound(' + cLayers[i].extent + ')">go</a></td></tr>';
            }

        }, // End CRWidget.createServiceList()
        getLayersBound: function (cLayers) {
            // for (var j=0; j<myJson.length;j++){
            // 	for (var k=0;k<myJson[j].property.length;k++){
            // 		for (var l=0;l<cLayers.length;l++){
            // 			if (myJson[j].property[k].serviceName == cLayers[l]){
            // 				boundArray.push(myJson[j].property[k].extent);
            // 			}
            // 		}

            // 	}
            // }
            for (var l = 0; l < cLayers.length; l++) {
                FCCMap.boundArray.push(cLayers[l].extent);
            }
            mapExtent = null;
            mapExtent = new OpenLayers.Bounds(
            FCCMap.boundArray[0][0], FCCMap.boundArray[0][1], FCCMap.boundArray[0][2], FCCMap.boundArray[0][3]);
            if (FCCMap.boundArray.length > 1) {
                for (var x = 1; x < FCCMap.boundArray.length; x++) {
                    var bounds = new OpenLayers.Bounds(
                    FCCMap.boundArray[x][0], FCCMap.boundArray[x][1], FCCMap.boundArray[x][2], FCCMap.boundArray[x][3]);
                    mapExtent.extend(bounds);
                }
            }
            mapExtent = mapExtent.transform(map.displayProjection, map.projection);

           FCCMap.map.zoomToExtent(mapExtent);

        }, // End CRWidget.getLayersBound()
				getSLDBody: function (layerName, index) {
	 var sld = '<StyledLayerDescriptor version="1.0.0">';
		sld+= '<NamedLayer>';
        sld+= '<Name>coverageright201010:' + layerName + '</Name>';
        sld+= '<UserStyle>';
        sld+= '<IsDefault>1</IsDefault>';
        sld+= '<FeatureTypeStyle>';
        sld+= '<Rule>';
        sld+= '<PolygonSymbolizer>';
        sld+= '<Fill>';
        sld+= '<CssParameter name="fill">';
        sld+= '<Literal>' + CRWidget.colorArray[index] + '</Literal>';
        sld+= '</CssParameter>';
        sld+= '<CssParameter name="fill-opacity">';
        sld+= '<Literal>0.5</Literal>';
        sld+= '</CssParameter>';
        sld+= '</Fill>';
        // sld+= '<Stroke>';
        // sld+= '<CssParameter name="stroke">';
        // sld+= '<Literal>#333333</Literal>';
        // sld+= '</CssParameter>';
        // sld+= '<CssParameter name="stroke-width">';
        // sld+= '<Literal>0</Literal>';
        // sld+= '</CssParameter>';
        // sld+= '</Stroke>';
        sld+= '</PolygonSymbolizer>';
        sld+= '</Rule>';
        sld+= '</FeatureTypeStyle>';
        sld+= '</UserStyle>';
        sld+= '</NamedLayer>';
        sld+= '</StyledLayerDescriptor>';
        return sld;
}, // END CRWidget.getSLDBody

        drawMap: function () {
            var selectedObj = [];
            for (var i = 0; i < CRWidget.propData.length; i++) {
                for (var j = 0; j < CRWidget.propData[i].property.length; j++) {
                    for (var x = 0; x < CRWidget.selectedID.length; x++) {
                        if (parseInt(CRWidget.selectedID[x]) == CRWidget.propData[i].property[j].id) {
                            var myObj = new Object();
                            myObj = CRWidget.propData[i].property[j];
                            myObj["techType"] = CRWidget.propData[i].techType;
                            selectedObj.push(myObj);
                        }
                    }
                }
            }
            
            this.updateCoverageLayers(selectedObj);
        } // End CRWidget.drawMap()
    }

    FCCMap.init();
    CRWidget.getData();
})();