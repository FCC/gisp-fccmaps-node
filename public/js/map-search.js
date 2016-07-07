'use strict';

var mapSearch = {
    init: function() {
        
        $('#btn-locSearch').on('click', 'button', mapSearch.locChange);
        $('#btn-coordSearch').on('click', 'button', mapSearch.search_decimal);
        $('#btn-geoLocation').on('click', mapSearch.geoLocation);
        $("#btn-nationLocation").on('click', function() {
            mapLayers.map.setView([50, -105], 3);
        });

         $("#input-search-switch").on('click', 'a', mapSearch.search_switch);

        $('#location-search')
            .autocomplete({
                source: function(request, response) {
                    var location = request.term;
                    mapLayers.geocoder.query(location, processAddress);

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
                    setTimeout(function() { mapSearch.locChange(); }, 200);
                },
                open: function() {
                    $(this).removeClass('ui-corner-all').addClass('ui-corner-top');
                },
                close: function() {
                    $(this).removeClass('ui-corner-top').addClass('ui-corner-all');
                }
            })
            .keypress(function(e) {
                var key = e.which;

                if (key === 13) {
                    mapSearch.locChange();
                }
            });

        $('#latitude, #longitude').keypress(function(e) {
            var key = e.which;

            if (key === 13) { 
                mapSearch.search_decimal();                
            }
        });
    },
    locChange: function() {
        var loc = $("#location-search").val();
        mapLayers.geocoder.query(loc, codeMap);

        function codeMap(err, data) {

            if (data.results.features.length === 0) {
                alert("The address provided could not be found. Please enter a new address.");
                return;
            }
            var lat = data.latlng[0];
            var lon = data.latlng[1];

            mapLayers.map.setView([lat, lon], 14);

        }
    },
    search_decimal: function() {
        var lat = $('#latitude').val().replace(/ +/g, '');
        var lon = $('#longitude').val().replace(/ +/g, '');

        if (lat === '' || lon === '') {
            alert('Please enter lat/lon');
            return;
        }

        if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
            alert('Lat/Lon values out of range');
            return;
        }

        mapLayers.map.setView([lat, lon], 14);
    },
    geoLocation: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geo_lat = position.coords.latitude;
                var geo_lon = position.coords.longitude;
                var geo_acc = position.coords.accuracy;

                geo_lat = Math.round(geo_lat * 1000000) / 1000000.0;
                geo_lon = Math.round(geo_lon * 1000000) / 1000000.0;

                mapLayers.map.setView([geo_lat, geo_lon], 14);

            }, function(error) {              
                alert('Sorry, your current location could not be determined. \nPlease use the search box to enter your location.');
            });
        } else {
            alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.');
        }

        return false;
    },
    search_switch: function(e) {
        var search = $(e.currentTarget).data('value');

        e.preventDefault();

        if (search === 'loc') {
            $('#coord-search').addClass('hide');
            $('#btn-coordSearch').addClass('hide');

            $('#location-search').removeClass('hide');
            $('#btn-locSearch').removeClass('hide');
            $('#btn-label').text('Address');
        } else if (search === 'latlon-decimal') {
            $('#coord-search').removeClass('hide');
            $('#btn-coordSearch').removeClass('hide');

            $('#location-search').addClass('hide');
            $('#btn-locSearch').addClass('hide');
            $('#btn-label').text('Coordinates');
        }
    }
};