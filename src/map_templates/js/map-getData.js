'use strict';

// TODO: get final list of bureaus and abbreviations
var bureauAbbr = {
    'MB': 'Media Bureau',
    'OSP': 'Office of Strategic Policy and Planning Analysis',
    'WTB': 'Wireless Telecommunications',
    'OET': 'Office of Engineering and Technology',
    'WCB': 'Wireline Competition',
    'PSHSB': ' Public Safety and Homeland Security',
    'IB': 'International Bureau',
    'EB': 'Enforcement Bureau',
    'CGB': 'Consumer and Governmental Affairs Bureau'
};

function hasProp(obj, prop) {
    if (obj) {
        return obj[0][prop];
    } else {
        return false;
    }
}

function arrUnique(arr) {
    var i,
        len = arr.length,
        unique = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        unique.push(i);
    }
    return unique;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*function getBureauAbbr(bureauName) {

    var tempArr = $.makeArray(bureauAbbr);

    $.map(bureauAbbr, function(val, key) {
        console.log(val);
        if (val.search(bureauName) > -1) {
            return key;
        }
    });
}*/

// populate bureau filter dropdown
function getBureauFilters(bureaus) {
    var bureauFilters = [],
        options = '';        

    bureauFilters = arrUnique(bureaus).sort();

    for (var k = 0; k < bureauFilters.length; k++) {
        options += '<option value="' + bureauFilters[k] + '">' + bureauAbbr[bureauFilters[k]] + '</option>';
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

function updateMapMeta(data, mapMeta, mapJSON) {

    var bureau = '';
    var map_info = '';

    var desc_str = hasProp(mapJSON.fields.field_description.und, 'value') || '';
    var isJson = isJsonString(desc_str);

    mapMeta.urls.push(mapJSON.url);
    mapMeta.titles.push(mapJSON.title);
    mapMeta.subtitles.push(mapJSON.subtitle);
    mapMeta.descriptions.push(mapJSON.fields.field_description.und[0].value);
    mapMeta.vids.push(mapJSON.vid);
    mapMeta.create_tss.push(mapJSON.created);    

    if (isJson) {
        map_info = JSON.parse(desc_str);
        bureau = map_info.bureau;
    } 

    mapMeta.bureaus.push(bureau);
    mapMeta.dates.push(mapJSON.changed);
    mapMeta.archiveds.push(mapJSON.archived);
    mapMeta.lives.push(mapJSON.live);
    mapMeta.featureds.push(mapJSON.featured);

    mapMeta.center_lats.push(mapJSON.latitude);
    mapMeta.center_lons.push(mapJSON.longitude);

    mapMeta.zooms.push(mapJSON.initialzoom);

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

function createMapCard(mapMeta) {
    var urls = mapMeta.urls;
    // var text = '';
    var card = '';
    for (var i = 0; i < urls.length; i++) {

        var url = urls[i].substr(urls[i].lastIndexOf('/') + 1) + '/responsive.html';
        var url_bookmark = urls[i] + '/#' + mapMeta.zooms[i] + '/' + mapMeta.center_lats[i] + '/' + mapMeta.center_lons[i] + '/zoom,attr,layers,key,search';

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
    
        card += '<li class="card data-all bureau-' + mapMeta.bureaus[i] + ' ' + add_class + ' tag-data-maps-reports tag-maps">';
        card += '<div class="mapThumb-btns">' + '<a class="btn btn-xs btn-default" href="' + url_bookmark + '"><span class="sr-only">View map</span> <span class="icon icon-external-link-square"></span></a>' + '</div>';
        card += '<div class="ribbon"><span>Featured</span></div>';
        card += '<iframe src="' + url + '" title="' + url.split('/')[0] + '" name="' + url.split('/')[0] + '"></iframe>';
        card += '<p class="card__title text-overflow"><a href="' + url_bookmark + '"><span >' + mapMeta.titles[i] + '</span></a></p>';
        card += '<div class="card__meta"><div class="pull-left">' + mapMeta.bureaus[i] + '</div><div class="pull-right data-date">' + mapMeta.dates[i] + '</div></div>';
        card += '<div class="card__body" id="t' + i + '"" aria-hidden="true" role="region" style="display: none;">';
        card += '<p class="card__subTitle text-overflow">' + mapMeta.subtitles[i] + '</p>';
        // TODO: populate description with actual text
        // card += '<p class="card__desc">' + mapMeta.descriptions[i] + '</p>';
        card += '<p class="card__desc">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi consectetur aliquid, excepturi aspernatur, libero porro ipsa omnis iusto autem, harum molestias dicta corrupti! Laudantium, autem, doloremque. Doloribus officia molestiae, praesentium.</p>';
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
    };

    getMapMeta(data, mapMeta);
    getBureauFilters(mapMeta.bureaus);
    createMapCard(mapMeta);
}

function getMapData() {
    var url = '/getExistingMaps';

    $.ajax(url, {
        type: 'GET',
        url: url,
        dataType: 'json',
        success: populateMaps
    });
}


$(document).ready(function() {
    getMapData();
});
