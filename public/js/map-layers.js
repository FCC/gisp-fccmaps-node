'use strict'

Handlebars.registerHelper('legendType', function(legendText, legendColor, options) {
    var keyImgDiag = 'background-image: url(./images/legend-thumb-slash.png)';
    var keyImgDots = 'background-image: url(./images/legend-thumb-dot.png)';

    if (legendColor === '%diag') {
        return keyImgDiag;
    } else if (legendColor === '%dots') {
        return keyImgDots;
    } else {
        return 'background-color:' + legendColor;
    }

});

var mapOpts = {
    getOpts: function() {		

        var urlHash = window.location.hash,
            isEmbed = window.location.pathname.split('/')[window.location.pathname.split('/').length-2] === 'embed',
            args = [],
            displayOpts = '';

        mapOpts.zoom = true;
        mapOpts.attr = true;
        mapOpts.layers = true;
        mapOpts.legend = true;
        mapOpts.search = true;

        if (isEmbed) {
            if (urlHash.indexOf('#') === 0) {
                urlHash = urlHash.substr(1);
            }
            args = urlHash.split('/');

            if (args[3] !== undefined) {
                displayOpts = args[3].split(',');

                mapOpts.zoom = displayOpts.indexOf('zoom') > -1;
                mapOpts.attr = displayOpts.indexOf('attr') > -1;
                mapOpts.layers = displayOpts.indexOf('layers') > -1;
                mapOpts.legend = displayOpts.indexOf('key') > -1;
                mapOpts.search = displayOpts.indexOf('search') > -1;
            }

            if (!mapOpts.search) {
                $('#search-field-holder').toggleClass('hasSearch hide');
            }
        } else {
            $('[data-toggle="tooltip"]').tooltip({ container: 'body', delay: { show: 200, hide: 0 } });
        }

    }
};

var mapLayers = {
    data: {},
    map: undefined,
    geocoder: undefined,
    init: function() {

        mapOpts.getOpts();

        mapLayers.createMap();

        //legend
        if (!mapOpts.legend) {
            $('.map-legend, .legend__icon').toggleClass('hide');
        }

        $('#btn-closeLegend').on('click', function(e) {
            e.preventDefault();
            $('.map-legend').hide('fast');
        });

        $('#btn-openLegend').on('click', function(e) {
            e.preventDefault();
            $('.map-legend').show('fast');
        });
    
    },
    createMap: function() {
            var map;
            var mapData = mapLayers.data;
            var initialzoom = 5;
            var maxzoom = 15;
            var minzoom = 3;
            var center_lat = 50;
            var center_lon = -105;
            var baseLayer = {};
            var layerControl;

            initialzoom = mapData.init.zoom;
            maxzoom = mapData.config.zoom.max || maxzoom;
            minzoom = mapData.config.zoom.min || minzoom;
            center_lat = mapData.init.lat || center_lat;
            center_lon = mapData.init.lon || center_lon;

            L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
            map = L.mapbox.map('map-container', 'fcc.k74ed5ge', {
                    attributionControl: mapOpts.attr,
                    maxZoom: maxzoom,
                    minZoom: minzoom,
                    zoomControl: mapOpts.zoom
                })
                .setView([center_lat, center_lon], initialzoom);

            var hash = L.hash(map);

            var baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge');
            var baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
            var baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');

            //base layers
            baseLayer.Street = baseStreet.addTo(map);
            baseLayer.Satellite = baseSatellite;
            baseLayer.Terrain = baseTerrain;

            // if (mapData.map_basemap && mapData.map_basemap[0].toLowerCase() == "street") {
            //     baseLayer["Street"] = baseStreet.addTo(map);
            //     baseLayer["Satellite"] = baseSatellite;
            //     baseLayer["Terrain"] = baseTerrain;
            // } else if (mapData.map_basemap && mapData.map_basemap[0].toLowerCase() == "satellite") {
            //     baseLayer["Street"] = baseStreet;
            //     baseLayer["Satellite"] = baseSatellite.addTo(map);
            //     baseLayer["Terrain"] = baseTerrain;
            // } else if (mapData.map_basemap && mapData.map_basemap[0].toLowerCase() == "terrain") {
            //     baseLayer["Street"] = baseStreet;
            //     baseLayer["Satellite"] = baseSatellite;
            //     baseLayer["Terrain"] = baseTerrain.addTo(map);
            // }

            //map layers
            var mapLayer = {};
            var zindex1 = 10;

            if (mapData.layers.length > 0) {
                for (var i = 0; i < mapData.layers.length; i++) {
                    zindex1++;

                    if (mapData.layers[i].type == 'XYZ') {

                        var title = mapData.layers[i].title;
                        if (title == '') {
                            title = '' + i;
                        }

                        var query = mapData.layers[i].query;
                        if (query === '') {
                            query = 'access_token=pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
                        }

                        var url = '//' + mapData.layers[i].domain + '/{z}/{x}/{y}.png?' + query;

                        mapLayer[title] = L.tileLayer(url, {
                            opacity: mapData.layers[i].opacity,
                            zIndex: zindex1
                        });

                        if (mapData.layers[i].visibile === true) {
                            mapLayer[title].addTo(map);
                        }
                    } else if (mapData.layers[i].type === 'WMS') {
                        var titleWMS = mapData.layers[i].title;
                        if (titleWMS === '') {
                            titleWMS = '' + i;
                        }

                        mapLayer[titleWMS] = L.tileLayer.wms(mapData.layers[i].protocol + '://' + mapData.layers[i].domain + '/wms', {
                            format: 'image/' + mapData.layers[i].format,
                            transparent: true,
                            opacity: mapData.layers[i].opacity,
                            layers: mapData.layers[i].name,
                            styles: mapData.layers[i].style,
                            zIndex: zindex1
                        });

                        if (mapData.layers[i].visible === 'on') {
                            mapLayer[titleWMS].addTo(map);
                        }
                    }
                }
            }

            //layer control
            if (mapOpts.layers) {
                layerControl = new L.Control.Layers(
                    baseLayer, mapLayer, {
                        position: 'topleft'
                    }
                ).addTo(map);
            }

            mapLayers.map = map;

            mapLayers.geocoder = L.mapbox.geocoder('mapbox.places-v1');

        } //end createMap
}; //end MapLayers
