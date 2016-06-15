

function iframeSetup() {
    var map_type = map_info_all.map_type;
    var url = map_info_all.webUrl;

    $('.map-iframe')
        .attr('src', url)
        .css({
            'height': map_info_all.map_frame_size.height,
            'width': map_info_all.map_frame_size.width
        });
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
            updateText();
            iframeSetup();
        }

    });

});
