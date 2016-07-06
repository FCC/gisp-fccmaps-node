(function(window, document, $) {
    'use strict';

    var mapTemplate = {
        dataAPI: '/api/data.json?id=' + window.location.pathname.replace(/\//g, ''),
        
        getData: function() {
            $.ajax({
                dataType: 'json',
                success: function(data) {
                    mapTemplate.createTemplate(data);
                },
                type: 'GET',
                url: mapTemplate.dataAPI
            });
        },

        createTemplate: function(mapData) {
            var source = $('#map-template').html();
            var template;
            var mapType = mapData[0].map_type;            

            /*Handlebars.registerHelper('isIframe', function(map_type, options) {
                if (map_type === 'layers') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });*/

            Handlebars.registerHelper('formatDate', function(dateReviewed) {
                var dateStr = dateReviewed.split(' ')[0].split('-');
                var MM = dateStr[1];
                var DD = dateStr[2];
                var YYYY = dateStr[0];

                return (MM + '/' + DD + '/' + YYYY);
            });

            template = Handlebars.compile(source);

            $('#map-details').append(template(mapData[0]));
            document.title = mapData[0].map_title;

            if (mapType === 'layers') {
                mapLayers.data = mapData[0];
                mapLayers.init();
                mapSearch.init();
            }
            
            shareLinks.init();
        }
    };   

    mapTemplate.getData();

}(window, document, jQuery));
