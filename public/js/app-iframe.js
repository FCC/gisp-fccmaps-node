function iframeSetup() {    
    var map_type = map_info_all.map_type;
    var url = map_info_all.webUrl;

    $(document).ajaxStop(function() {
        var iFrame = $('.map-iframe')[0];
        var frameStyles = 'height: ' + map_info_all.map_frame_size.height + '; width: ' + map_info_all.map_frame_size.width;

        // get iframe src w/o adding it to browser history
        iFrame.contentWindow.location.replace(url);
        iFrame.setAttribute('style', frameStyles);       
    });
}


$(document).ready(function() {
    var url = "/api/raw.json";
    
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
