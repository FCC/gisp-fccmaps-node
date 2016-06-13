'use strict';

function hasProp(obj, prop) {
    if (obj) {
        return obj[0][prop];
    } else {
        return false;
    }
}

function uniqueBureau(arr) {

    var uniqueBureaus = [];
    var dupes = {};
    
    $.each(arr, function(i, el) {
        if (!dupes[el.tid]) {
            dupes[el.tid] = true;
            uniqueBureaus.push(el);
        }
    });   

    return uniqueBureaus;
}

// populate bureau filter dropdown
function getBureauFilters(bureaus) {
    var options = '';
    var bureauFilters = uniqueBureau(bureaus);        

    for (var k = 0; k < bureauFilters.length; k++) { 
        options += '<option value="' + bureauFilters[k].tid + '">' + bureauFilters[k].value + '</option>';
    } 

    $('#sel-filter').find('option').eq(0).after(options);

}

function getMapMeta(data, mapMeta) {

    var mapJSON = {};

    for (var i = 1; i < data.length; i++) {
        //mapJSON.data = data[i];
        mapJSON.fields = data[i].fields;
        mapJSON.title = data[i].title;
        // var nid = mapData.nid;
        mapJSON.vid = data[i].vid;
        mapJSON.created = data[i].created;
        mapJSON.changed = data[i].changed;
        // var updated = mapDataFields.field_date_updated_reviewed.und ? mapDataFields.field_date_updated_reviewed.und[0].value : '';

        // if (data[i].fields.field_date_updated_reviewed.und) {
        //     updated = data[i].fields.field_date_updated_reviewed.und[0].value;
        // }

        mapJSON.url = hasProp(mapJSON.fields.field_map_page_url.und, 'url') || '';

        mapJSON.repo = hasProp(mapJSON.fields.field_map_repository.und, 'url') || '';

        mapJSON.subtitle = hasProp(mapJSON.fields.field_subtitle.und, 'value') || '';

        mapJSON.archived = hasProp(mapJSON.fields.field_archived.und, 'value') || '0';

        mapJSON.live = mapJSON.archived === '0' ? '1' : '0';

        mapJSON.featured = hasProp(mapJSON.fields.field_featured.und, 'value') || '0';

        mapJSON.latitude = hasProp(mapJSON.fields.field_map_latitude.und, 'value') || '50.00';
        mapJSON.longitude = hasProp(mapJSON.fields.field_map_longitude.und, 'value') || '-105.00';
        mapJSON.initialzoom = hasProp(mapJSON.fields.field_map_initial_zoom.und, 'value') || '3';

        if (mapJSON.url !== '' || mapJSON.repo !== '') {
            updateMapMeta(data[i], mapMeta, mapJSON);
        }
    }

}


function getMapMeta1(data, mapMeta) {

    var mapJSON = {};

    for (var i = 1; i < data.length; i++) {

        var map_info_all = getMapInfo(data[i]);
        mapJSON.map_type = map_info_all.map_type;
        mapJSON.title = map_info_all.title;
        mapJSON.description = map_info_all.description;
        mapJSON.bureau = map_info_all.bureau_office;
        mapJSON.vid = map_info_all.vid;
        mapJSON.created = map_info_all.date;
        mapJSON.changed = map_info_all.date_updated_reviewed;
        mapJSON.url = map_info_all.map_page_url_url;
        mapJSON.repo = '';
        mapJSON.subtitle = map_info_all.subtitle;
        mapJSON.archived = map_info_all.archived;
        mapJSON.live = mapJSON.archived === '0' ? '1' : '0';
        mapJSON.featured = map_info_all.featured;
        mapJSON.latitude = map_info_all.map_latitude || '50.00';
        mapJSON.longitude = map_info_all.map_longitude || '-105.00';
        mapJSON.initialzoom = map_info_all.map_initial_zoom || '3';
        mapJSON.thumbnail = map_info_all.image_thumbnail;
        mapJSON.webUrl = map_info_all.webUrl;

        if (mapJSON.url !== '') {
            updateMapMeta(data[i], mapMeta, mapJSON);
        }
    }

}






function updateMapMeta(data, mapMeta, mapJSON) {

    var bureau = '';
    var map_info = '';

    //var desc_str = hasProp(mapJSON.fields.field_description.und, 'value') || '';
    //var isJson = isJsonString(desc_str);

    mapMeta.urls.push(mapJSON.url);
    mapMeta.titles.push(mapJSON.title);
    mapMeta.subtitles.push(mapJSON.subtitle);
    mapMeta.descriptions.push(mapJSON.description);
    mapMeta.vids.push(mapJSON.vid);
    mapMeta.create_tss.push(mapJSON.created);
    mapMeta.bureaus.push(mapJSON.bureau);
    mapMeta.dates.push(mapJSON.changed);
    mapMeta.archiveds.push(mapJSON.archived);
    mapMeta.lives.push(mapJSON.live);
    mapMeta.featureds.push(mapJSON.featured);

    mapMeta.center_lats.push(mapJSON.latitude);
    mapMeta.center_lons.push(mapJSON.longitude);

    mapMeta.zooms.push(mapJSON.initialzoom);
    mapMeta.mapTypes.push(mapJSON.map_type);
    mapMeta.thumbnail.push(mapJSON.thumbnail);

    /*if (map_info !== '') { 
        mapMeta.zooms.push(map_info.mapzoom.initialzoom);        
        mapMeta.center_lats.push(mapJSON.latitude);        
        mapMeta.center_lats.push(mapJSON.longitude);
    } else {
        mapMeta.zooms.push(3);
        mapMeta.center_lats.push(40);
        mapMeta.center_lons.push(-105);
    } */

}

function formatDate(dateFormat) {
    var dateStr = dateFormat.split('-');
    var MM = dateStr[1];
    var DD = dateStr[2];
    var YYYY = dateStr[0];

    return (MM + '/' + DD + '/' + YYYY);
}

function createMapCard(mapMeta) {
    var urls = mapMeta.urls;
    // var text = '';
    var card = '';
    var url = '';
    var isMapLayers = false;
    var embedLink = '';
    var url_bookmark = '';
    var thumbImg = '';
    var subtitle = '';

    for (var i = 0; i < urls.length; i++) {

        isMapLayers = mapMeta.mapTypes[i] === 'layers';

        if (mapMeta.mapTypes[i] === 'layers') {
            url = urls[i].substr(urls[i].lastIndexOf('/') + 1);
            embedLink = url + '/embed/#' + mapMeta.zooms[i] + '/' + mapMeta.center_lats[i] + '/' + mapMeta.center_lons[i] + '/';
            url_bookmark = url + '/#' + mapMeta.zooms[i] + '/' + mapMeta.center_lats[i] + '/' + mapMeta.center_lons[i];
            thumbImg = '<iframe src="' + embedLink + '" title="' + url.split('/')[0] + '" name="' + url.split('/')[0] + '" frameborder="0" vspace="0" hspace="0" marginwidth="0" marginheight="0"></iframe>';
        } else if (mapMeta.mapTypes[i] === 'iframe') {
            url = urls[i].substr(urls[i].lastIndexOf('/') + 1);
            embedLink = mapMeta.webUrl;
            url_bookmark = url;
            thumbImg = '<div class="thumbnail img-responsive"><div style="background-image: url(' + mapMeta.thumbnail[i] + ')" title="' + mapMeta.titles[i] + '"></div></div>';
        } else {
            url = urls[i];
            embedLink = url; // '/';
            url_bookmark = url;
            thumbImg = '<div class="thumbnail img-responsive"><div style="background-image: url(' + mapMeta.thumbnail[i] + ')" title="' + mapMeta.titles[i] + '"></div></div>';
        }

        var add_class = '';
        if (mapMeta.lives[i] === '1') {
            add_class += 'data-live ';
        }

        if (mapMeta.archiveds[i] === '1') {
            add_class += 'data-archived ';
        }
        if (mapMeta.featureds[i] === '1') {
            add_class += 'data-featured';
        }

        if (mapMeta.subtitles[i] !== "0") {
            subtitle = '<p class="card__subTitle text-overflow">' + mapMeta.subtitles[i] + '</p>'
        } else {
            subtitle = '';
        }

        card += '<li class="card data-all bureau-' + mapMeta.bureaus[i].tid + ' ' + add_class + ' tag-data-maps-reports tag-maps">';
        card += '<div class="mapThumb-btns">' + '<a class="btn btn-xs btn-default" href="' + url_bookmark + '"><span class="sr-only">View map</span> <span class="icon icon-external-link-square"></span></a>' + '</div>';
        card += '<div class="ribbon"><span>Featured</span></div>';
        card += thumbImg;
        //card += '<iframe src="' + embedLink + '" title="' + url.split('/')[0] + '" name="' + url.split('/')[0] + '"></iframe>';
        card += '<p class="card__title text-overflow"><a href="' + url_bookmark + '"><span >' + mapMeta.titles[i] + '</span></a></p>';
        card += '<div class="card__meta"><div class="pull-left">' + mapMeta.bureaus[i].tid + '</div><div class="pull-right data-date">' + formatDate(mapMeta.dates[i].split(' ')[0]) + '</div></div>';
        card += '<div class="card__body" id="t' + i + '"" aria-hidden="true" role="region" style="display: none;">';
        card += subtitle;
        // TODO: populate description with actual text
        // card += '<p class="card__desc">' + mapMeta.descriptions[i] + '</p>';
        card += '<div class="card__desc">' + mapMeta.descriptions[i] + '</div>';
        card += '<a class="link-viewMore" href="' + url_bookmark + '">View more&#8230;</a>';
        card += '<ul class="list-unstyled"><li class="tag"><span>Data, Maps, Reports</span></li><li class="tag"><span>Maps</span></li></ul></div>';
        card += '<div class="card__footer"><button class="btn-details btn btn-link btn-xs" type="button" aria-expanded="false" aria-controls="t' + i + '"><span class="icon icon-caret-right"></span>View details</button></div>';
        card += '</li>';

    }

    window.allMaps = $(card);

}

function populateMaps(data) {

    var mapMeta = {
        urls: [],
        titles: [],
        subtitles: [],
        descriptions: [],
        vids: [],
        create_tss: [],
        zooms: [],
        center_lats: [],
        center_lons: [],
        searches: [],
        bureaus: [],
        dates: [],
        archiveds: [],
        featureds: [],
        lives: [],
        mapTypes: [],
        thumbnail: []
    };

    getMapMeta1(data, mapMeta);
    getBureauFilters(mapMeta.bureaus);
    createMapCard(mapMeta);
}

function getMapData() {
    var url = '/api.json';

    $.ajax(url, {
        type: 'GET',
        url: url,
        dataType: 'json',
        success: populateMaps
    });
}



function getMapInfo(mapOptions) {
    var map_info_all = {};

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
        var bureau_office = mapOptions.fields.field_bureau_office.und[0];
        //bureau_office = getBureau(tid);
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
        description = mapOptions.fields.field_description.und[0].safe_value;
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
    var map_max_zoom = '12';
    if (mapOptions.fields.field_map_max_zoom && mapOptions.fields.field_map_max_zoom.und) {
        map_max_zoom = mapOptions.fields.field_map_max_zoom.und[0].value;
    }
    map_info_all.map_max_zoom = map_max_zoom;

    //map_min_zoom
    var map_min_zoom = '3';
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
    var map_type = '';
    if (mapOptions.fields.field_map_type && mapOptions.fields.field_map_type.und) {
        map_type = mapOptions.fields.field_map_type.und[0].value;
    }
    map_info_all.map_type = map_type;

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

    return map_info_all;

}









$(document).ready(function() {
    getMapData();
});
