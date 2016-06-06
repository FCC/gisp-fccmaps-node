var map;
var layerList = [];
var mapLayers = [];
var mapOptions;
var map_info;
var map_info_all = {};
var layers_info;
var initialzoom = 5;
var maxzoom = 15;
var minzoom = 1;
var center_lat = 50;
var center_lon = -105;
var hash = null;

// get url hash and display options
var urlHash = window.location.hash,
    isEmbed = window.location.pathname.split('/')[2] === 'embed',
    args = [],
    displayOpts = '',
    hasZoom = false,
    hasAttribution = false,
    hasLayers = false,
    hasLegend = false,
    hasSearch = false;

function createMap() {

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

    if (args[3] !== undefined) {
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
            minZoom: minzoom,
            zoomControl: hasZoom
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

    console.log(map_info_all.map_basemap);

    for (var i = 0; i < map_info_all.map_basemap.length; i++) {
        if (i == 0) {
            if (map_info_all.map_basemap[i].toLowerCase() == "street") {
                baseLayer["Street"] = baseStreet.addTo(map);
            } else if (map_info_all.map_basemap[i].toLowerCase() == "satellite") {
                baseLayer["Satellite"] = baseSatellite.addTo(map);
            } else if (map_info_all.map_basemap[i].toLowerCase() == "terrain") {
                baseLayer["Terrain"] = baseTerrain.addTo(map);
            }
        } else {
            if (map_info_all.map_basemap[i].toLowerCase() == "street") {
                baseLayer["Street"] = baseStreet;
            } else if (map_info_all.map_basemap[i].toLowerCase() == "satellite") {
                baseLayer["Satellite"] = baseSatellite;
            } else if (map_info_all.map_basemap[i].toLowerCase() == "terrain") {
                baseLayer["Terrain"] = baseTerrain;
            }

        }

    }

    console.log(baseLayer)

    //map layers
    mapLayer = {};
    zindex1 = 10;

    if (map_info_all.map_layer.length > 0) {
        for (var i = 0; i < map_info_all.map_layer.length; i++) {
            console.log(i);

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
                console.log(url)
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
        var keyImg = 'background-image: url(images/legend-thumb-slash.png)';

        for (var i = 0; i < map_info_all.map_legend.length; i++) {

            keyStyle = map_info_all.map_legend[i].text.search('Tribal land') > -1 ? keyImg : keyColor + map_info_all.map_legend[i].color;

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


function createSearchFields() {
    if (hasSearch) {
        if ((map_info_all.map_address_search && map_info_all.map_address_search.toLowerCase() == "on") || (map_info_all.map_coordinate_search && map_info_all.map_coordinate_search.toLowerCase() == "on")) {
            // $('#search-field-holder').css("display", "block");
            $('#search-field-holder')
                .addClass('hasSearch')
                .show();

        } else {
            // $('#search-field-holder').css("display", "none");
            $('#search-field-holder')
                .removeClass('hasSearch')
                .hide();
        }
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

        var field_text = '<div id="search-field" class="input-group" style="width: 920px"> \
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

        field_text += '<span class="input-group-btn" id="span-location-search" style="display: table-cell"> \
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
    var lat = lat_deg + lat_min / 60.0 + lat_sec / 3600.0;
    lat = Math.round(lat * 1000000) / 1000000.0;

    if (ns == "S") {
        lat = -1 * lat;
    }

    lon_deg = Math.floor(lon_deg);
    lon_min = Math.floor(lon_min);
    if (lon_sec == "") {
        lon_sec = 0;
    }
    lon_sec = parseFloat(lon_sec);
    var lon = lon_deg + lon_min / 60.0 + lon_sec / 3600.0;
    lon = Math.round(lon * 1000000) / 1000000.0;

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

        if ($('#' + id).prop('checked')) {
            //remove layer
            if (map.hasLayer(mapLayers[i])) {
                map.removeLayer(mapLayers[i]);
            }
            //add layer
            mapLayers[i].addTo(map);
        } else {
            //remove layer
            if (map.hasLayer(mapLayers[i])) {
                map.removeLayer(mapLayers[i]);
            }
        }
    });

    // hide legend      
    $('.btn-closeLegend').on("click", function(e) {
        $('#div-legend').hide('fast');
    });

    // show legend
    $('#div-legend-icon').on("click", function(e) {
        $('#div-legend').show('fast');
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
        } else if (search == 'latlon-dms') {
            $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
            $("#input-latlon-decimal").css('display', 'none');
            $("#span-latlon-decimal-search").css('display', 'none');

            $("#input-latlon-dms").css('display', 'block');
            $("#span-latlon-dms-search").css('display', 'table-cell');
            $("#btn-label").text('Lat/lon (DMS)');
        } else if (search == 'latlon-decimal') {
            $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
            $("#input-latlon-dms").css('display', 'none');
            $("#span-latlon-dms-search").css('display', 'none');

            $("#input-latlon-decimal").css('display', 'block');
            $("#span-latlon-decimal-search").css('display', 'table-cell');
            $("#btn-label").text('Coordinates');
        }

    });

    $('#input-location').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-loc-search').click();
            return false;
        }
    });


    $('#lat-deg, #lon-deg, #lat-min, #lon-min, #lat-sec, #lon-sec, #select-ns, #select-ew').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-latlon-dms-search').click();
            return false;
        }
    });


    $('#latitude, #longitude').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
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


    $("#input-location").autocomplete({
        source: function(request, response) {
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
        select: function(event, ui) {
            setTimeout(function() { searchLocation(); }, 200);
        },
        open: function() {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function() {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });

}


function updateMapSize() {
    if (map_info.mapwidth) {

        $('#search-field').css("width", map_info.mapwidth);
        $('#map-holder').css("width", map_info.mapwidth);
        //$('#map').css("width", map_info.mapwidth);

    }
    if (map_info.mapheight) {
        $('#map-holder').css("height", map_info.mapheight);
        $('#map').css("height", map_info.mapheight);

    }

    document.title = map_info.title;

}

function getBureau(tid) {
    var bureau = '';
    if (mapOptions.taxonomy) {
        for (var i = 0; i < mapOptions.taxonomy.length; i++) {
            if (mapOptions.taxonomy[i].tid == tid) {
                bureau = mapOptions.taxonomy[i].name;
            }
        }

    }

    return bureau;
}

function getMapInfo() {
    //map_info = mapOptions.fields.field_description.und[0].value;

    //map_info = JSON.parse(map_info);
    //layers_info = map_info.layers;

    console.log(mapOptions);

    //title
    var title = '';
    if (mapOptions.title) {
        title = mapOptions.title;
    }
    map_info_all.title = title;

    //webUrl
    var webUrl = '';
    if (mapOptions.webUrl) {
        webUrl = mapOptions.webUrl;
    }
    map_info_all.webUrl = webUrl;

    //archived
    var archived = '0';
    if (mapOptions.fields.field_archived && mapOptions.fields.field_archived.und) {
        archived = mapOptions.fields.field_archived.und[0].value;
    }
    map_info_all.archived = archived;

    //bureau_office
    var bureau_office = '';
    if (mapOptions.fields.field_bureau_office && mapOptions.fields.field_bureau_office.und) {
        var tid = mapOptions.fields.field_bureau_office.und[0].tid;
        bureau_office = getBureau(tid);
    }
    map_info_all.bureau_office = bureau_office;

    //date
    var date = ''
    if (mapOptions.fields.field_date && mapOptions.fields.field_date.und) {
        date = mapOptions.fields.field_date.und[0].value;
    }
    map_info_all.date = date;

    //date_updated_reviewed
    var date_updated_reviewed = ''
    if (mapOptions.fields.field_date_updated_reviewed && mapOptions.fields.field_date_updated_reviewed.und) {
        date_updated_reviewed = mapOptions.fields.field_date_updated_reviewed.und[0].value;
    }
    map_info_all.date_updated_reviewed = date_updated_reviewed;

    //description
    var description = ''
    if (mapOptions.fields.field_description && mapOptions.fields.field_description.und) {
        description = mapOptions.fields.field_description.und[0].value;
    }
    map_info_all.description = description;

    //featured
    var featured = '0'
    if (mapOptions.fields.field_featured && mapOptions.fields.field_featured.und) {
        featured = mapOptions.fields.field_featured.und[0].value;
    }
    map_info_all.featured = featured;

    //image_thumbnail
    var image_thumbnail = '';
    if (mapOptions.fields.field_image_thumbnail && mapOptions.fields.field_image_thumbnail.und) {
        image_thumbnail = mapOptions.fields.field_image_thumbnail.und[0].uri;
    }
    map_info_all.image_thumbnail = image_thumbnail;

    //link
    var link = [];

    //map_address_search
    var map_address_search = 'on';
    if (mapOptions.fields.field_map_address_search && mapOptions.fields.field_map_address_search.und) {
        map_address_search = mapOptions.fields.field_map_address_search.und[0].value;
    }
    map_info_all.map_address_search = map_address_search;

    //map_attribution
    var map_attribution = '';
    if (mapOptions.fields.field_map_attribution && mapOptions.fields.field_map_attribution.und) {
        map_attribution = mapOptions.fields.field_map_attribution.und[0].value;
    }
    map_info_all.map_attribution = map_attribution;

    //map_basemap

    var map_basemap = []
    if (mapOptions.fields.field_map_basemap && mapOptions.fields.field_map_basemap.und) {
        for (var i = 0; i < mapOptions.fields.field_map_basemap.und.length; i++) {
            map_basemap.push(mapOptions.fields.field_map_basemap.und[i].value);
        }
    }
    map_info_all.map_basemap = map_basemap;

    //map_coordinate_search
    var map_coordinate_search = 'on'
    if (mapOptions.fields.field_map_coordinate_search && mapOptions.fields.field_map_coordinate_search.und) {
        map_coordinate_search = mapOptions.fields.field_map_coordinate_search.und[0].value;
    }
    map_info_all.map_coordinate_search = map_coordinate_search;

    //map_display_date
    var map_display_date = '';
    if (mapOptions.fields.field_map_display_date && mapOptions.fields.field_map_display_date.und) {
        map_display_date = mapOptions.fields.field_map_display_date.und[0].value;
    }
    map_info_all.map_display_date = map_display_date;

    //map_embedded_code


    //map_initial_zoom
    var map_initial_zoom = '';
    if (mapOptions.fields.field_map_initial_zoom && mapOptions.fields.field_map_initial_zoom.und) {
        map_initial_zoom = mapOptions.fields.field_map_initial_zoom.und[0].value;
    }
    map_info_all.map_initial_zoom = map_initial_zoom;

    //map_latitude
    var map_latitude = '0';
    if (mapOptions.fields.field_map_latitude && mapOptions.fields.field_map_latitude.und) {
        map_latitude = mapOptions.fields.field_map_latitude.und[0].value;
    }
    map_info_all.map_latitude = map_latitude;

    //map_layer
    var map_layer = [];
    if (mapOptions.fields.field_map_layer) {
        for (var i = 0; i < mapOptions.fields.field_map_layer.length; i++) {
            var domain = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_domain && mapOptions.fields.field_map_layer[i].field_layer_domain.und) {
                domain = mapOptions.fields.field_map_layer[i].field_layer_domain.und[0].value;
            }
            var format = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_format && mapOptions.fields.field_map_layer[i].field_layer_format.und) {
                format = mapOptions.fields.field_map_layer[i].field_layer_format.und[0].value;
            }
            var name = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_name && mapOptions.fields.field_map_layer[i].field_layer_name.und) {
                name = mapOptions.fields.field_map_layer[i].field_layer_name.und[0].value;
            }
            var opacity = 1.0;
            if (mapOptions.fields.field_map_layer[i].field_layer_opacity && mapOptions.fields.field_map_layer[i].field_layer_opacity.und) {
                opacity = mapOptions.fields.field_map_layer[i].field_layer_opacity.und[0].value;
            }
            var protocol = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_protocol && mapOptions.fields.field_map_layer[i].field_layer_protocol.und) {
                protocol = mapOptions.fields.field_map_layer[i].field_layer_protocol.und[0].value;
            }
            var query_string = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_query_string && mapOptions.fields.field_map_layer[i].field_layer_query_string.und) {
                query_string = mapOptions.fields.field_map_layer[i].field_layer_query_string.und[0].value;
            }
            var style = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_style && mapOptions.fields.field_map_layer[i].field_layer_style.und) {
                style = mapOptions.fields.field_map_layer[i].field_layer_style.und[0].value;
            }
            var title = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_title && mapOptions.fields.field_map_layer[i].field_layer_title.und) {
                title = mapOptions.fields.field_map_layer[i].field_layer_title.und[0].value;
            }
            var type = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_type && mapOptions.fields.field_map_layer[i].field_layer_type.und) {
                type = mapOptions.fields.field_map_layer[i].field_layer_type.und[0].value;
            }
            var visibility = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_visibility && mapOptions.fields.field_map_layer[i].field_layer_visibility.und) {
                visibility = mapOptions.fields.field_map_layer[i].field_layer_visibility.und[0].value;
            }

            var entry = {
                "domain": domain,
                "format": format,
                "name": name,
                "opacity": opacity,
                "protocol": protocol,
                "query_string": query_string,
                "style": style,
                "title": title,
                "type": type,
                "visibility": visibility
            };

            map_layer.push(entry);


        }

    }

    map_info_all.map_layer = map_layer;

    //map_legend
    var map_legend = [];
    if (mapOptions.fields.field_map_legend) {
        for (var i = 0; i < mapOptions.fields.field_map_legend.length; i++) {
            var color = '#FFFFFF';
            if (mapOptions.fields.field_map_legend[i].field_legend_color && mapOptions.fields.field_map_legend[i].field_legend_color.und) {
                color = mapOptions.fields.field_map_legend[i].field_legend_color.und[0].value;
            }
            var text = '';
            if (mapOptions.fields.field_map_legend[i].field_legend_text && mapOptions.fields.field_map_legend[i].field_legend_text.und) {
                text = mapOptions.fields.field_map_legend[i].field_legend_text.und[0].value;
            }
            var entry = {
                "color": color,
                "text": text
            };
            map_legend.push(entry);

        }
    }
    map_info_all.map_legend = map_legend;



    //map_longitude
    var map_longitude = '0';
    if (mapOptions.fields.field_map_longitude && mapOptions.fields.field_map_longitude.und) {
        map_longitude = mapOptions.fields.field_map_longitude.und[0].value;
    }
    map_info_all.map_longitude = map_longitude;

    //map_max_zoom
    var map_max_zoom = maxzoom;
    if (mapOptions.fields.field_map_max_zoom && mapOptions.fields.field_map_max_zoom.und) {
        map_max_zoom = mapOptions.fields.field_map_max_zoom.und[0].value;
    }
    map_info_all.map_max_zoom = map_max_zoom;

    //map_min_zoom
    var map_min_zoom = minzoom;
    if (mapOptions.fields.field_map_min_zoom && mapOptions.fields.field_map_min_zoom.und) {
        map_min_zoom = mapOptions.fields.field_map_min_zoom.und[0].value;
    }
    map_info_all.map_min_zoom = map_min_zoom;

    //map_options

    //map_page_url
    var map_page_url_url = '';
    var map_page_url_title = '';
    if (mapOptions.fields.field_map_page_url && mapOptions.fields.field_map_page_url.und) {
        map_page_url_url = mapOptions.fields.field_map_page_url.und[0].url;
        map_page_url_title = mapOptions.fields.field_map_page_url.und[0].title;
    }
    map_info_all.map_page_url_url = map_page_url_url;
    map_info_all.map_page_url_title = map_page_url_title;

    //map_repository

    //map_status

    //map_type

    //publishing_bureau_office

    //related content

    //related_link

    //related_links
    var related_links = [];
    if (mapOptions.fields.field_related_links && mapOptions.fields.field_related_links.und) {
        for (var i = 0; i < mapOptions.fields.field_related_links.und.length; i++) {
            var title = mapOptions.fields.field_related_links.und[i].title;
            var url = mapOptions.fields.field_related_links.und[i].url;
            entry = { "title": title, "url": url }
            related_links.push(entry);

        }
    }
    map_info_all.related_links = related_links;

    //search_exclude
    var search_exclude = "0";
    if (mapOptions.fields.field_search_exclude && mapOptions.fields.field_search_exclude.und) {
        search_exclude = mapOptions.fields.field_search_exclude.und[0].value;
    }
    map_info_all.search_exclude = search_exclude;

    //subtitle
    var subtitle = "0";
    if (mapOptions.fields.field_subtitle && mapOptions.fields.field_subtitle.und) {
        subtitle = mapOptions.fields.field_subtitle.und[0].value;
    }
    map_info_all.subtitle = subtitle;

    console.log(map_info_all);

}

function updateText() {

    // var json_obj = JSON.parse(mapOptions.fields.field_description.und[0].value);
    // var bureau = "NA"
    // if (json_obj.bureau) {
    // bureau = json_obj.bureau;
    // }
    // var title = mapOptions.title;
    // var subtitle = mapOptions.fields.field_subtitle.und[0].value;
    // var created = mapOptions.created;
    // var changed = mapOptions.changed;

    // $(document).prop('title', title);
    // $('#span-title').html(title);
    // $('#span-subtitle').html(subtitle);
    // $('#dd-published').html(created);
    // $('#dd-updated').html(changed);
    // $('#span-bureau').html(bureau);

    // map_info = mapOptions.fields.field_description.und[0].value;
    // map_info = JSON.parse(map_info);
    // var description = map_info.description;
    // $('#span-description').html(description);


    //var json_obj = JSON.parse(mapOptions.fields.field_description.und[0].value);
    //var title = mapOptions.title;
    //var subtitle = mapOptions.fields.field_subtitle.und[0].value;
    //var created = mapOptions.created;
    //var changed = mapOptions.changed;

    $(document).prop('title', map_info_all.title);
    $('#span-title').html(map_info_all.title);
    $('#span-subtitle').html(map_info_all.subtitle);
    $('#dd-published').html(map_info_all.date);
    $('#dd-updated').html(map_info_all.date_updated_reviewed);
    $('#span-bureau').html(map_info_all.bureau_office);
    $('#span-description').html(map_info_all.description);

    console.log('office=' + map_info_all.bureau_office);

}


function updateMapList() {
    var url = "/getExistingMaps";
    $.ajax(url, {
        type: "GET",
        url: url,
        dataType: "json",
        success: function(data) {

            var urls = [];
            var titles = [];
            var subtitles = [];
            var descriptions = [];
            var vids = [];
            var create_tss = [];
            var zooms = [];
            var center_lats = [];
            var center_lons = [];
            var searches = [];

            for (var i = 1; i < data.length; i++) {
                var title = data[i].title;
                var url = "";
                if (data[i].fields.field_map_page_url.und) {
                    url = data[i].fields.field_map_page_url.und[0].url;
                }
                var repo = "";
                if (data[i].fields.field_map_repository.und) {
                    repo = data[i].fields.field_map_repository.und[0].url;
                }

                if (url + repo != "") {
                    urls.push(url);
                    titles.push(title);
                }
            }

            function isJsonString(str) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            }

            //var urls = data.urls;
            //var titles = data.titles;
            var map_list_text = "";
            for (var i = 0; i < urls.length; i++) {
                map_list_text += '<li><a href="/' + urls[i] + '" class=""> \
                    <iframe width="150" height="125" src="/' + urls[i] + '/responsive.html"></iframe> \
                    <p>' + titles[i] + '</p> \
                    </a></li>';
            }

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

});
