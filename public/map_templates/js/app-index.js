

function createMap() {

    var initialzoom = 5;
    var maxzoom = 15;
    var minzoom = 3;
    var center_lat = 50;
    var center_lon = -105;

    if (map_info_all.map_initial_zoom) {
        initialzoom = map_info_all.map_initial_zoom;
    }
    if (map_info_all.map_max_zoom) {
        maxzoom = map_info_all.map_max_zoom;
    }
    if (map_info_all.map_min_zoom) {
        minzoom = map_info_all.map_min_zoom;
    }

    if (map_info_all.map_latitude) {
        center_lat = map_info_all.map_latitude;
    }
    if (map_info_all.map_longitude) {
        center_lon = map_info_all.map_longitude;
    }


    if (urlHash.indexOf('#') === 0) {
        urlHash = urlHash.substr(1);
    }
    args = urlHash.split('/');

    if (isEmbed && args[3] !== undefined) {
        displayOpts = args[3].split(',');

        hasZoom = displayOpts.indexOf('zoom') > -1;
        hasAttribution = displayOpts.indexOf('attr') > -1;
        hasLayers = displayOpts.indexOf('layers') > -1;
        hasLegend = displayOpts.indexOf('key') > -1;
        hasSearch = displayOpts.indexOf('search') > -1;
    }

    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
    map = L.mapbox.map('map-container', 'fcc.k74ed5ge', {
            attributionControl: hasAttribution,
            maxZoom: maxzoom,
            minZoom: minzoom
        })
        .setView([center_lat, center_lon], initialzoom);

    if (map_info_all.map_attribution && hasAttribution) {
        map.attributionControl.addAttribution(map_info_all.map_attribution);
    }

    this.hash = L.hash(map);

    baseStreet = L.mapbox.tileLayer('fcc.k74ed5ge');
    baseSatellite = L.mapbox.tileLayer('fcc.k74d7n0g');
    baseTerrain = L.mapbox.tileLayer('fcc.k74cm3ol');
    var baseLayer = {};

    //default
    baseLayer["Street"] = baseStreet.addTo(map);
    baseLayer["Satellite"] = baseSatellite;
    baseLayer["Terrain"] = baseTerrain;
    if (map_info_all.map_basemap && map_info_all.map_basemap[0].toLowerCase() == "street") {
        baseLayer["Street"] = baseStreet.addTo(map);
        baseLayer["Satellite"] = baseSatellite;
        baseLayer["Terrain"] = baseTerrain;
    } else if (map_info_all.map_basemap && map_info_all.map_basemap[0].toLowerCase() == "satellite") {
        baseLayer["Street"] = baseStreet;
        baseLayer["Satellite"] = baseSatellite.addTo(map);
        baseLayer["Terrain"] = baseTerrain;
    } else if (map_info_all.map_basemap && map_info_all.map_basemap[0].toLowerCase() == "terrain") {
        baseLayer["Street"] = baseStreet;
        baseLayer["Satellite"] = baseSatellite;
        baseLayer["Terrain"] = baseTerrain.addTo(map);
    }

    //map layers
    mapLayer = {};
    zindex1 = 10;

    if (map_info_all.map_layer.length > 0) {
        for (var i = 0; i < map_info_all.map_layer.length; i++) {
            zindex1++;

            if (map_info_all.map_layer[i].type == 'XYZ') {

                var title = map_info_all.map_layer[i].title;
                if (title == '') {
                    title = '' + i;
                }

                var query_string = map_info_all.map_layer[i].query_string;
                if (query_string == '') {
                    query_string = 'access_token=pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg';
                }

                var url = '//' + map_info_all.map_layer[i].domain + '/{z}/{x}/{y}.png?' + query_string;

                mapLayer[title] = L.tileLayer(url, {
                    opacity: map_info_all.map_layer[i].opacity,
                    zIndex: zindex1
                });

                if (map_info_all.map_layer[i].visibility == 'on') {
                    mapLayer[title].addTo(map);
                }
            } else if (map_info_all.map_layer[i].type == 'WMS') {
                var title = map_info_all.map_layer[i].title;
                if (title == '') {
                    title = '' + i;
                }

                mapLayer[title] = L.tileLayer.wms(map_info_all.map_layer[i].protocol + '://' + map_info_all.map_layer[i].domain, {
                    format: 'image/' + map_info_all.map_layer[i].format,
                    transparent: true,
                    opacity: map_info_all.map_layer[i].opacity,
                    layers: map_info_all.map_layer[i].name,
                    styles: map_info_all.map_layer[i].style,
                    zIndex: zindex1
                });

                if (map_info_all.map_layer[i].visibility == 'on') {
                    mapLayer[title].addTo(map);
                }
            }
        }
    }


    if (hasLayers) {
        layerControl = new L.Control.Layers(
            baseLayer, mapLayer, {
                position: 'topleft'
            }
        ).addTo(map);
    }

    geocoder = L.mapbox.geocoder('mapbox.places-v1');

    //make legend

    if (hasLegend && map_info_all.map_legend.length && map_info_all.map_legend.length > 0) {
        var legend_text1 = '';
        var keyStyle = '';
        var keyColor = 'background-color:';
        var keyImgTribal = 'background-image: url(images/legend-thumb-slash.png)';
        var keyImgUrban = 'background-image: url(images/legend-thumb-dot.png)';

        for (var i = 0; i < map_info_all.map_legend.length; i++) {

            if (map_info_all.map_legend[i].text.search('Tribal land') > -1) {
                keyStyle = keyImgTribal;
            } else if (map_info_all.map_legend[i].text.search('Urban area') > -1) {
                keyStyle = keyImgUrban;
            } else {
                keyStyle = keyColor + map_info_all.map_legend[i].color;
            }

            /*keyStyle = map_info_all.map_legend[i].text.search('Tribal land') > -1 
                        ? keyImg 
                        : keyColor + map_info_all.map_legend[i].color;*/

            legend_text1 += '<tr><td style="width: 28px; height: 28px;"><div style="width: 20px; height: 20px;' + keyStyle + '"; opacity: 1.0; border: solid 1px #999999"></div></td><td>' + map_info_all.map_legend[i].text + '</td></tr>' + '\n';

        }

        var legend_text = '<div id="div-legend" class="map-legend">' +
            '<table>' +
            '<tr><td colspan=3>' +
            '<span class="icon icon-list"></span> <span class="map-legend-name">Map Legend</span>' +
            '<button class="btn-closeLegend btn btn-xs pull-right">' +
            '<span class="icon icon-close"></span> <span class="sr-only">Hide legend</span>' +
            '</button>' +
            '</td></tr>' +
            legend_text1 +
            '</table>' +
            '</div>' +
            '<div id="div-legend-icon" class="legend__icon" title="Map Legend">' +
            '<span class="icon icon-list"></span>' +
            '</div>';

        $('#div-legend-holder').html(legend_text);
    }

}


$(document).ready(function() {

    var url = "/api.json";
    $.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data) {
            contentJson = data;
            getMapOption();
            getMapInfo(mapOptions);
            updateMapList();
            updateText();
            createMap();
            createSearchFields();
            setupListener();
        }

    });

});
