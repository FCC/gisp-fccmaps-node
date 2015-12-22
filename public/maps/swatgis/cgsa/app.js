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
    


  // Contextual layer switching
  $('ul.macro li a').click(function() {
      if (this.id == 'a-block'){
          activeLayers = [
             '800-mhz-cellular-a-block-cgsa'
          ];
      }
      if (this.id == 'b-block'){
          activeLayers = [
              '800-mhz-cellular-b-block-cgsa'
          ];
      }
      $('ul.macro li a').removeClass('active');
      $(this).addClass('active');
     
      layers = [
          activeLayers
      ];
      cleanLayers = $.compact(layers);
      layers = cleanLayers.join(',');
      refreshMap();
  });
  
  $('form.location-search').submit(function (e){
      e.preventDefault();
      var inputValue = input.val(),
      encodedInput = encodeURIComponent(inputValue);
      geocode(encodedInput);
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
  
});

   var interaction;
    // Define the layers and other map variables
    var layers = [
        '800-mhz-cellular-a-block-cgsa'
        ],
        cleanLayers;
        cleanLayers = $.compact(layers);
        layers = cleanLayers.join(',');
        var urlBase = $.map(['a','b','c','d'],function(sub) {
          return 'http://' + sub + '.tiles.mapbox.com/fcc/1.0.0/'+layers+'/';
          //a.tiles.mapbox.com/fcc/1.0.0/800-mhz-cellular-a-block-cgsa/layer.json
        }),
        mm = com.modestmaps,
        m, test;

    // Update tiles array
    function getTiles() {
      return $.map(urlBase, function(base) {
        return base + '{z}/{x}/{y}.png';
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
            return 'http://' + sub + '.tiles.mapbox.com/fcc/1.0.0/'+layers+'/';
        });
        wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
            tilejson.minzoom = 3;
            tilejson.maxzoom = 10;
            tilejson.tiles = getTiles();
            tilejson.grids = getGrids();
            // remove embedded styles to prevent web font flickers
           // tilejson.formatter = tilejson.formatter.replace(/<style(.*?)style>/gi,'');
            interaction.remove();
            interaction =  wax.mm.interaction(m, tilejson);
            m.setProvider(new wax.mm.connector(tilejson));
            $('.wax-legends').remove();

            legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
        });
    }

    function mapChange() {
        if (!$('#a-block').hasClass('active')) {
            $('#b-block').removeClass('active');
            $('#a-block').addClass('active');

            layers = [
                    800-mhz-cellular-a-block-cgsa
            ];
            cleanLayers = $.compact(layers);
            layers = cleanLayers.join(',');
            refreshMap();
        }
        else{
        	 $('#a-block').removeClass('active');
             $('#b-block').addClass('active');

             layers = [
                     800-mhz-cellular-b-block-cgsa
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
                            zoom: 6,
                            time: 2000
                        });
                    } else {
                        easey.slow(m, {
                            location: new mm.Location(value.lat, value.lon),
                            zoom: 8,
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
      tilejson.maxzoom = 10;
      //tilejson.legend = activeLegend;
      // remove embedded styles to prevent web font flickers
      //tilejson.formatter = tilejson.formatter.replace(/<style(.*?)style>/gi,'');

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
     interaction =  wax.mm.interaction(m, tilejson);
      wax.mm.zoombox(m, tilejson);
      wax.mm.legend(m, tilejson).appendTo(m.parent);
      wax.mm.zoomer(m, tilejson).appendTo($('#controls')[0]);
      wax.mm.attribution(m, tilejson).appendTo(m.parent);
      wax.mm.hash(m, tilejson, {
        defaultCenter: new mm.Location(39, -84),
        defaultZoom: 4,
        manager: wax.mm.locationHash
      });
    });   

     

    // Handle geocoder form submission
    var input = $('.location-search input[type=text]');
        inputTitle = 'Enter a place or zip code';
        input.val(inputTitle);

   

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

   

   