function populateMaps() {

        var url = "/getExistingMaps";
        $.ajax(url, {
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data) {
                console.log(data);
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
                var bureaus = [];
                var dates = [];
				var archiveds = [];
				var featureds = [];
				var lives = [];

                for (var i = 1; i < data.length; i++) {

                    var title = data[i].title;
                    var nid = data[i].nid;
                    var vid = data[i].vid;
                    var created = data[i].created;
                    var changed = data[i].changed;
                    var updated = ""
                    if (data[i].fields.field_date_updated_reviewed.und) {
                        updated = data[i].fields.field_date_updated_reviewed.und[0].value;
                    }
                    var url = "";
                    if (data[i].fields.field_map_page_url.und) {
                        url = data[i].fields.field_map_page_url.und[0].url;
                    }
                    var repo = "";
                    if (data[i].fields.field_map_repository.und) {
                        repo = data[i].fields.field_map_repository.und[0].url;
                    }
                    var subtitle = "";
                    if (data[i].fields.field_subtitle.und) {
                        subtitle = data[i].fields.field_subtitle.und[0].value;
                    }
					var archived = "0";
					if (data[i].fields.field_archived && data[i].fields.field_archived.und) {
						archived = data[i].fields.field_archived.und[0].value;
					}
					if (archived == "0") {
						var live = "1";
					}
					else {
						var live = "0";
					}
					var featured = "0";
					if (data[i].fields.field_featured && data[i].fields.field_featured.und) {
						featured = data[i].fields.field_featured.und[0].value;
					}
                    //console.log('nid='+nid);
                    if (url + repo != "") {
                        //console.log('getting nid='+nid);
                        urls.push(url);
                        titles.push(title);
                        subtitles.push(subtitle);
                        descriptions.push("Descriptions go here");
                        vids.push(vid);
                        create_tss.push(created);
                        var bureau = "";
                        var map_info = "";
                        if (data[i].fields.field_description.und) {
                            var desc_str = data[i].fields.field_description.und[0].value;
                            if(desc_str) {
                               //console.log('desc_str='+desc_str);
                                var isJson = isJsonString(desc_str);
                                if(isJson){
                                    map_info = JSON.parse(desc_str);
                                    bureau = map_info.bureau;
                                }
                            }
                        }
                        bureaus.push(bureau);
                        dates.push(changed);
						archiveds.push(archived);
						lives.push(live);
						featureds.push(featured);

                        /*var map_info = "";
                        if (data[i].fields.field_description.und) {
                            var value_str = data[i].fields.field_description.und[0].value;
                            var map_info = JSON.parse(value_str);
                        }*/
                        if (map_info != "") {
                            zooms.push(map_info.mapzoom.initialzoom);
                            center_lats.push(map_info.mapcenter.latitude);
                            center_lons.push(map_info.mapcenter.longitude);
                        } else {
                            zooms.push(3);
                            center_lats.push(40);
                            center_lons.push(-105);
                        }
                    }

                }
				
				//console.log('archiveds=' + archiveds + ' lives=' + lives + ' featureds=' + featureds)

                // populate bureau filter dropdown
                function getBureauFilters() {
                    var bureauFilters = [],
                        options = '',
                        bureauAbbr = {
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

                    bureauFilters = arrUnique(bureaus).sort();

                    for (var k = 0; k < bureauFilters.length; k++) {
                        options += '<option value="' + bureauFilters[k] + '">' + bureauAbbr[bureauFilters[k]] + '</option>';
                    }

                    $('#sel-filter').find('option').eq(0).after(options);

                }
                
                function isJsonString(str) {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                }

                getBureauFilters();


                var text = '';
                for (var i = 0; i < urls.length; i++) {

                    var url = urls[i] + "/responsive.html";
                    var url_bookmark = urls[i] + "/#" + zooms[i] + "/" + center_lats[i] + "/" + center_lons[i] + "/zoom,attr,layers,key,search";
					
					var add_class = "";
					if (lives[i] == "1") {
						add_class += "data-live ";
					}
					if (archiveds[i] == "1") {
						add_class += "data-archived ";
					}
					if (featureds[i] == "1") {
						add_class += "data-featured";
					}
					
					console.log(i + ' ' + titles[i] + ' addclass=' + add_class);
					
					
                    text += '<li class="card data-all bureau-' + bureaus[i] + ' ' + add_class + ' tag-data-maps-reports tag-maps"> \
                            <div class="mapThumb-btns"> \
                                <a class="btn btn-xs btn-default" href="' + url_bookmark + '"><span class="sr-only">View map</span> <span class="icon icon-external-link-square"></span></a> \
                            </div> \
                            <div class="ribbon"><span>Featured</span></div> \
                            <iframe src="' + url + '"></iframe> \
                            <p class="card__title text-overflow"><a href="' + url_bookmark + '"><span >' + titles[i] + '</span></a></p> \
                            <div class="card__meta"> \
                                <div class="pull-left">' + bureaus[i] + '</div> \
                                <div class="pull-right data-date">' + dates[i] + '</div> \
                            </div> \
                            <div class="card__body" aria-expanded="false" style="display: none;"> \
                                <p class="card__subTitle text-overflow">' + subtitles[i] + '</p> \
                                <p class="card__desc"> \
                                    Map description goes here. Map description goes here. Map description goes here. Map description goes here. Map description goes here. \
                                </p> \
                                <ul class="list-unstyled"> \
                                    <li class="tag"><a href="#" data-tag="data-maps-reports">Data, Maps, Reports</a></li> \
                                    <li class="tag"><a href="#" data-tag="maps">Maps</a></li> \
                                </ul> \
                            </div> \
                            <div class="card__footer"> \
                                <a class="btn-details btn btn-link btn-xs" href="#void" role="button" aria-pressed="false"><span class="icon icon-caret-right"></span>View details</a> \
                                <a class="btn btn-link btn-xs pull-right" href="' + url_bookmark + '"><span class="icon icon-external-link-square"></span>View map</a> \
                            </div> \
                        </li>';

                }
				
				//console.log(text);

                var $items = $(text);

                $('.map-cards').append($items).isotope('insert', $items);

                /* for testing only */
                $('.map-cards > li').eq(2).addClass('tag-Fall2014 tag-multiLayer');
                $('.map-cards > li').eq(2).find('.card__body .list-unstyled').append('<li class="tag"><a href="#" data-tag="multiLayer">multiLayer</a></li>');
                $('.map-cards > li').eq(2).find('.card__body .list-unstyled').append('<li class="tag"><a href="#" data-tag="Fall2014">Fall 2014</a></li>');

                $('.map-cards > li').eq(5).addClass('tag-Fall2014');
                $('.map-cards > li').eq(5).find('.card__body .list-unstyled').append('<li class="tag"><a href="#" data-tag="Fall2014">Fall 2014</a></li>');

                $('.map-cards').isotope('updateSortData');
            }
        });

    }

    $(document).ready(function() {
        populateMaps();
    });