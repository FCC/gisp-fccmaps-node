$.domReady(function () {

    // Share links
    $('a.link-pop').click(function (e){
        e.preventDefault();
        if($(this).hasClass('active')) {
            $('#share div').css('display', 'none');
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
            $('#share div').css('display', 'block');
        }
    });
    $('#share ul li a').click(function (e){
        e.preventDefault();
        var tweetUrl = 'http://twitter.com/share?via=developmentseed&text=US%20Census%20Map&url=' + encodeURIComponent(window.location),
            faceUrl = 'http://facebook.com/sharer.php?t=US%20Census%20Map&u=' + encodeURIComponent(window.location);
            $('#share .twitter').attr('href', tweetUrl);
            $('#share .facebook').attr('href', faceUrl);
            window.open($(this).attr('href'), 'share');
    });

    //Initial Highlighting as we start with the Hispanic Layer.
    $('#map').mousemove(function() {
        $('.wax-tooltip').each(function() {
            $('.highlight').remove();
            if($('.wax-tooltip div').hasClass('chart-int')) {
                $('<span class="highlight"></div>').appendTo(this);
            }
        });
    });

    // Define the layers and other map variables
    var layers = [
        'npr.USA-blank-trans-z11',
        'npr.world-blank-bright-0-10',
        'npr.usa-census-hispanic-PR-2-14',
        'npr.usa-census-hispanic-state-2-5-v2',
        'npr.usa-census-hispanic-county-6-9-v2',
        'npr.usa-census-hispanic-tracts-contusa-z10-14',
        'npr.usa-census-hispanic-tracts-ak-hi-z10-14',
        'mapbox.world-borders-dark'
        ],
        cleanLayers;
        cleanLayers = $.compact(layers);
        layers = cleanLayers.join(',');
        var urlBase = $.map(['a','b','c','d'],function(sub) {
          return 'http://' + sub + '.tiles.mapbox.com/npr/1.0.0/externals.streetlevel,'+layers+'/';
        }),
        mm = com.modestmaps,
        m, test;

       	totalLegend = '<div class="census-legend">'
                    + '<div class="census-title">'
                    + 'Percent Population Change (2000-2010)'
                    + '</div>'
                    + '<div class="census-scale">'
                    + '<ul class="census-labels">'
                    + '<li><span style="background:#935E9C;"></span><-20%</li>'
                    + '<li><span style="background:#B9A1C7;"></span>-20%</li>'
                    + '<li><span style="background:#E2D4E2;"></span>-10%</li>'
                    + '<li><span style="background:#ECECEC;"></span>+10%</li>'
                    + '<li><span style="background:#D7E7D3;"></span>+20%</li>'
                    + '<li><span style="background:#98C595;"></span>+30%</li>'
                    + '<li><span style="background:#519265;"></span>>+30%</li>'
                    + '</ul>'
                    + '</div>'
                    + '<div class="census-source">Data Source: <a href="http://www.census.gov">'
                    + 'U.S. Census Bureau</a>, '
                    + '<a href="http://www.ire.org/census/">IRE</a></div>'
                    + '</div>';

        hispanicLegend = '<div class="census-legend hispanic">'
                    + '<div class="census-title">'
                    + 'Percent Hispanic Population Change (2000-2010)'
                    + '</div>'
                    + '<div class="census-scale">'
                    + '<ul class="census-labels">'
                    + '<li><span style="background:#ca83d7;"></span><-20%</li>'
                    + '<li><span style="background:#cfb1ab;"></span>-20%</li>'
                    + '<li><span style="background:#eee1ee;"></span>-10%</li>'
                    + '<li><span style="background:#fffce0;"></span>10%</li>'
                    + '<li><span style="background:#fef3b7;"></span>20%</li>'
                    + '<li><span style="background:#fee88a;"></span>50%</li>'
                    + '<li><span style="background:#fdde60;"></span>100%</li>'
                    + '<li><span style="background:#fcca4e;"></span>150%</li>'
                    + '<li><span style="background:#faaf4e;"></span>200%</li>'
                    + '<li><span style="background:#f9914d;"></span>250%</li>'
                    + '<li><span style="background:#f7754d;"></span>>250%</li>'
                    + '</ul>'
                    + '</div>'
                    + '<div class="census-source">Data Source: <a href="http://www.census.gov">'
                    + 'U.S. Census Bureau</a>, '
                    + '<a href="http://www.ire.org/census/">IRE</a></div>'
                    + '</div>';

    activeLegend = hispanicLegend;

    // Update tiles array
    function getTiles() {
      return $.map(urlBase, function(base) {
        return base + '{z}/{x}/{y}.png256';
      });
    };

    // Update grid array
    function getGrids() {
      return $.map(urlBase, function(base) {
        return base + '{z}/{x}/{y}.grid.json';
      });
    };

    // Open a modal window
    function openModal(element) {
      $('#overlay, ' + element).css('display', 'block');
    }

    // Refresh Map
    function refreshMap() {
        urlBase = $.map(['a','b','c','d'],function(sub) {
            return 'http://' + sub + '.tiles.mapbox.com/npr/1.0.0/externals.streetlevel,'+layers+'/';
        });
        console.log(urlBase[0]+'layer.json');
        wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
            tilejson.minzoom = 4;
            tilejson.maxzoom = 14;
            tilejson.tiles = getTiles();
            tilejson.grids = getGrids();
            tilejson.legend = activeLegend;
            // remove embedded styles to prevent web font flickers
           // tilejson.formatter = tilejson.formatter.replace(/<style(.*?)style>/gi,'');
            
            m.setProvider(new wax.mm.connector(tilejson));
            $('.wax-legends').remove();

            legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
        });
    }

    function mapChange() {
        if (!$('#hispanic-pop').hasClass('active')) {
            $('#total-pop').removeClass('active');
            $('#hispanic-pop').addClass('active');
            activeLayers = [
                'npr.usa-census-hispanic-PR-2-14',
                'npr.usa-census-hispanic-state-2-5-v2',
                'npr.usa-census-hispanic-county-6-9-v2',
                'npr.usa-census-hispanic-tracts-contusa-z10-14',
                'npr.usa-census-hispanic-tracts-ak-hi-z10-14'
            ];
            layers = [
                'USA-blank-trans-z11',
                'world-blank-bright-0-10',
                activeLayers,
                'mapbox.world-borders-dark'
            ];
            cleanLayers = $.compact(layers);
            layers = cleanLayers.join(',');
            refreshMap();
        }
    }

    // Send address to MapQuest's Nominatim search
    function geocode(query) {
        $('ul.cities a').removeClass('active');
        loading();
        $.ajax({
            url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&countrycodes=us&limit=1&q=' + query,
            type: 'jsonp',
            jsonpCallback: 'callback',
            success: function (value) {
                value = value[0];
                $('.loading').remove();
                if (value === undefined) {
                    errorBox('<p>The search you tried did not return a result.</p>');
                } else {
                    if (value.type == 'state' || value.type == 'county' || value.type == 'maritime'  || value.type == 'country') {
                        easey.slow(m, {
                            location: new mm.Location(value.lat, value.lon),
                            zoom: 7,
                            time: 2000
                        });
                    } else {
                        easey.slow(m, {
                            location: new mm.Location(value.lat, value.lon),
                            zoom: 13,
                            time: 2000
                        });
                    }
                    $('.error').remove();
                }
            }
        });
    }

    // Show error message
    function errorBox(reason) {
      $('form.location-search').append('<div class="error">' + reason + '<a href="#" class="close">x</a><div>');
      $('a.close').click(function(e) {
        e.preventDefault();
        $('.error').remove();
      });
    }

    // Show loading image
    function loading() {
      $('body').append('<div class="loading"><img src="images/loader.gif" alt="loading" /></div>');
    }

    // Set up tilejson object of map settings
    wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
      tilejson.tiles = getTiles();
      tilejson.grids = getGrids();
      tilejson.minzoom = 4;
      tilejson.maxzoom = 14;
      tilejson.legend = activeLegend;
      // remove embedded styles to prevent web font flickers
      //tilejson.formatter = tilejson.formatter.replace(/<style(.*?)style>/gi,'');

      tilejson.attribution = '<a href="http://npr.org" target="_blank">'
        + '<img class="npr-white" src="images/npr.png" /></a> '
        + '<a href="http://developmentseed.org" target="_blank">'
        + '<img src="images/ds.png" /></a> '
        + 'Maps designed in <a href="http://www.tilemill.com" target="_blank">TileMill</a>. '
        + 'Search and street level map courtesy of '
        + '<a href="http://www.mapquest.com/" target="_blank">'
        + 'MapQuest</a>. Map data © <a href="http://www.openstreetmap.org/"'
        +' target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.';

      // Build the map
      m = new mm.Map('map',
        new wax.mm.connector(tilejson),
        null,
        [
          new mm.MouseHandler(),
          new mm.TouchHandler()
        ]
      );      
      m.setCenterZoom(new mm.Location(39, -95), 4);
      wax.mm.interaction(m, tilejson);
      wax.mm.zoombox(m, tilejson);
      wax.mm.legend(m, tilejson).appendTo(m.parent);
      wax.mm.zoomer(m, tilejson).appendTo($('#controls')[0]);
      wax.mm.attribution(m, tilejson).appendTo(m.parent);
      wax.mm.hash(m, tilejson, {
        defaultCenter: new mm.Location(39, -84),
        defaultZoom: 4,
        manager: wax.mm.locationHash
      });
      // Bandwidth detection control and switch element
      var detector = wax.mm.bwdetect(m, {
        auto: true,
        png: '.png64?'
      });
      m.addCallback('drawn', function lqDetect(modestmap, e) {
        if (!detector.bw()) {
          $('#bwtoggle').removeClass('active');
        }
        m.removeCallback(lqDetect);
      });
      $('a#bwtoggle').click(function (e) {
          e.preventDefault();
          $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active');
          detector.bw(!detector.bw());
      });

      // Map Embed
      $('a.embed').click(function(e){
        e.preventDefault();
        var splitLayers = layers.split(',');
        var center = m.pointLocation(new mm.Point(m.dimensions.x/2,m.dimensions.y/2));
        var embedUrl = 'http://api.tiles.mapbox.com/v2/' + splitLayers + '/mm/tooltips,legend,bwdetect.html#' + m.coordinate.zoom + '/' + center.lat + '/' + center.lon;
        $('#embed-code-field input').attr('value', '<iframe src="' + embedUrl + '" frameborder="0" width="650" height="500"></iframe>');
        openModal('#modal-embed');
        $('#embed-code')[0].tabindex = 0;
        $('#embed-code')[0].focus();
        $('#embed-code')[0].select();
      });
    });

    $(document.documentElement).keydown(function (e) {
        if (event.keyCode == 27) {
            $('a.close').trigger('click');
        }
    });
    // Contextual layer switching
    $('ul.macro li a').click(function() {
        $('ul.cities a').removeClass('active');
        if (this.id == 'total-pop'){
            activeLayers = [
                'npr.usa-census-totpop-PR-2-14',
                'npr.usa-census-totpop-state-2-5',
                'npr.usa-census-totpop-county-6-9',
                'npr.usa-census-totpop-tracts-conusa-10-14',
                'npr.usa-census-totpop-tracts-ak-hi-10-14'
            ];
            activeLegend = totalLegend;
        }
        if (this.id == 'hispanic-pop'){
            activeLayers = [
                'npr.usa-census-hispanic-PR-2-14',
                'npr.usa-census-hispanic-state-2-5-v2',
                'npr.usa-census-hispanic-county-6-9-v2',
                'npr.usa-census-hispanic-tracts-contusa-z10-14',
                'npr.usa-census-hispanic-tracts-ak-hi-z10-14'
            ];
            activeLegend = hispanicLegend;
        }
        $('ul.macro li a').removeClass('active');
        $(this).addClass('active');
        if($('ul.macro li a#hispanic-pop').hasClass('active')) {
            $('#map').mousemove(function() {
                $('.wax-tooltip').each(function() {
                    $('.highlight').remove();
                    if($('.wax-tooltip div').hasClass('chart-int')) {
                        $('<span class="highlight"></div>').appendTo(this);
                    }
                });
            });
        } else {
            $('#map').mousemove(function() {
                $('.wax-tooltip').each(function() {
                    $('.highlight').remove();
                });
            });
        }
        layers = [
            'USA-blank-trans-z11',
            'world-blank-bright-0-10',
            activeLayers,
            'mapbox.world-borders-dark'
        ];
        cleanLayers = $.compact(layers);
        layers = cleanLayers.join(',');
        refreshMap();
    });

    // Handle geocoder form submission
    var input = $('.location-search input[type=text]'),
        inputTitle = 'Enter a place or zip code';
        input.val(inputTitle);

    $('form.location-search').submit(function (e){
        e.preventDefault();
        var inputValue = input.val(),
        encodedInput = encodeURIComponent(inputValue);
        geocode(encodedInput);
    });

    // Remove default val on blur
    input.blur(function() {
    if (input.val() === '') {
        input.val(inputTitle);
    }
    }).focus(function() {
        if (input.val() === inputTitle) {
            input.val('');
        }
    });

    // Open about modal
    $('a.about.control').click(function(e) {
        e.preventDefault();
        openModal('#modal-about');
        $('#popup-about').tinyscrollbar_update();
    });

    // Close modals
    $('.modal a.close').click(function (e){
        e.preventDefault();
        $('#overlay').hide();
        $(this).closest('.modal').hide();
    });

    // City level Toggling of Hispanic Layers
    $('ul.cities a').click(function (e) {
        $('#map').mousemove(function() {
            $('.wax-tooltip').each(function() {
                $('.highlight').remove();
                if($('.wax-tooltip div').hasClass('chart-int')) {
                    $('<span class="highlight"></div>').appendTo(this);
                }
            });
        });
        if ($(this).hasClass('active')) {
           // Do nothing.
        } else {
            $('ul.cities a').removeClass('active');
            $(this).addClass('active');
            activeLegend = hispanicLegend;
            if(this.id === 'los-angeles') {
                easey.slow(m, {
                    location: new mm.Location(34.0502836, -118.2420861),
                    zoom: 6,
                    time: 2000,
                    callback: function() {
                        easey.slow(m, {
                            zoom: 10,
                            time: 2000,
                            callback: function() {
                                mapChange();
                            }
                        });
                    }
                });
            }
            if(this.id === 'new-york') {
                easey.slow(m, {
                    location: new mm.Location(40.6639794658547, -73.9382651457157),
                    zoom: 6,
                    time: 2000,
                    callback: function() {
                        easey.slow(m, {
                            zoom: 10,
                            time: 2000,
                            callback: function() {
                                mapChange();
                            }
                        });
                    }
                });
            }
            if(this.id === 'chicago') {
                easey.slow(m, {
                    location: new mm.Location(41.8756208, -87.6243706),
                    zoom: 6,
                    time: 2000,
                    callback: function() {
                        easey.slow(m, {
                            zoom: 9,
                            time: 2000,
                            callback: function() {
                                mapChange();
                            }
                        });
                    }
                });
            }
            if(this.id === 'san-francisco') {
                easey.slow(m, {
                    location: new mm.Location(37.7789601, -122.419199),
                    zoom: 6,
                    time: 2000,
                    callback: function() {
                        easey.slow(m, {
                            zoom: 10,
                            time: 2000,
                            callback: function() {
                                mapChange();
                            }
                        });
                    }
                });
            }
            if(this.id === 'washington-dc') {
                easey.slow(m, {
                    location: new mm.Location(38.8951148, -77.0363716),
                    zoom: 6,
                    time: 2000,
                    callback: function() {
                        easey.slow(m, {
                            zoom: 11,
                            time: 2000,
                            callback: function() {
                                mapChange();
                            }
                        });
                    }
                });
            }
        }
    });
});