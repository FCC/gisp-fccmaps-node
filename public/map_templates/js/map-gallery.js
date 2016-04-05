(function(window, document, $) {
    'use strict';

    var mapGallery = {
        filters: {
            bureau: '',
            tag: '',
            status: '.data-live'
        },
        filterOpts: {
            all: '*',

            MB: '.bureau-MB',

            WCB: '.bureau-WCB',

            WTB: '.bureau-WTB',

            OSP: '.bureau-OSP',

            OET: '.bureau-OET'

        },        
        sortList: {
            sortBy: 'date',
            sortAscending: false
        },
        sortOpts: {
            dateAsc: {
                sortBy: 'date',
                sortAscending: true
            },
            dateDesc: {
                sortBy: 'date',
                sortAscending: false
            },
            titleAsc: {
                sortBy: 'cardTitle',
                sortAscending: true
            },
            titleDesc: {
                sortBy: 'cardTitle',
                sortAscending: false
            }
        },
        selectedTags: [],
        isIsotopeInit: false,

        init: function() {
            mapGallery.initGrid();

            $('.map-cards')
                .on('click', '.btn-details', mapGallery.showCardDetails)
                .on('click', '.tag a', mapGallery.addTag);

            $('#sel-filter').on('change', mapGallery.filterByBureau);
            $('#sel-sort').on('change', mapGallery.sorting);

            $('.tag-list-inline').on('click', '.link-removeTag', mapGallery.removeTag);

            $('.map-status').on('click', '.btn', mapGallery.filterByStatus);

            $('.link-clearFilters').on('click', mapGallery.clearFilters);          

            $('.map-cards').on('layoutComplete', function(event, filteredItems) {
                $('.gallery__numResults')
                    .html('Showing: ' + filteredItems.length + ' maps')
                    .focus();

                if (filteredItems.length === 0) {
                    $('.alert-noResults').removeClass('hide');
                } else {
                    $('.alert-noResults').addClass('hide');
                }
            });
        },

        initGrid: function() {
            $('.map-cards').isotope({
                masonry: {
                    columnWidth: 265,
                    gutter: 25
                },
                getSortData: {
                    // date: '.data-date',
                    date: function(itemElem) {
                        return Date.parse($(itemElem).find('.data-date').text());
                    },
                    cardTitle: '.card__title'
                },
                itemSelector: '.card',
                sortBy: mapGallery.sortList.sortBy,
                sortAscending: mapGallery.sortList.sortAscending
            });
        },      

        showCardDetails: function(e) {
            var thisBtn = $(this),
                thisCard = thisBtn.closest('.card').find('.card__body'),
                thisCardBody = thisBtn.closest('.card').find('.card__body');

            e.preventDefault();
            thisCard.closest('.card').css('z-index', 1);

            if (thisCard.is(':visible')) {
                thisBtn
                    .html('<span class="icon icon-caret-right"></span>View details')
                    .attr('aria-pressed', false);

                thisCardBody.slideUp(function() {
                    thisCardBody.attr('aria-expanded', false);
                    thisBtn.closest('.card').css('z-index', 0);
                    $('.map-cards').isotope('layout');
                });
            } else {
                thisBtn
                    .html('<span class="icon icon-caret-down"></span>Hide details')
                    .attr('aria-pressed', true);

                thisCardBody.slideDown(function() {
                    thisCardBody.attr('aria-expanded', true);
                    thisBtn.closest('.card').css('z-index', 0);
                    $('.map-cards').isotope('layout');
                });
            }
        },

        sorting: function() {
            var selectedVal = this.value;

            mapGallery.sortList.sortBy = mapGallery.sortOpts[selectedVal].sortBy;
            mapGallery.sortList.sortAscending = mapGallery.sortOpts[selectedVal].sortAscending;

            mapGallery.locationHash();

        },

        filterByBureau: function() {
            var selectedVal = this.value;

            mapGallery.filters.bureau = mapGallery.filterOpts[selectedVal];
            mapGallery.filter();
        },

        filterByStatus: function() { console.log(this);
            var selectedBtn = $(this).attr('data-filter'),
                btnGroup = $(this).closest('.map-status');

            btnGroup.find('.active').removeClass('active');
            $(this).addClass('active');

            mapGallery.filters.status = '.' + selectedBtn;
console.log(mapGallery.filters.status);
            mapGallery.filter();
        },

        removeTag: function(e) {
            var $tagLink = $(this),
                $tag = $tagLink.parent('span').attr('data-tag');

            var index = mapGallery.selectedTags.indexOf($tag);

            e.preventDefault();

            mapGallery.selectedTags.splice(index, 1);

            $tagLink.closest('.tag').remove();

            mapGallery.filterByTags();
        },

        addTag: function(e) {
            e.preventDefault();

            var $tagLink = $(this),
                $tag = $tagLink.attr('data-tag'),
                $tagText = $tagLink.text(),
                newTag = $tagLink.parent('li').clone();

            if (mapGallery.selectedTags.indexOf($tag) < 0) {

                mapGallery.selectedTags.push($tag);
                // console.log(mapGallery.selectedTags);
                newTag.find('a').replaceWith('<span data-tag="' + $tag + '">' + $tagText + '<a class="link-removeTag" href="#void"><span class="icon icon-remove"></span></span></a>');

                if (!$('.tag-list-inline').is(':visible')) {
                    $('.tag-list-inline').removeClass('hide');
                }

                $('.tag-list-inline').find('ul').append(newTag);

                mapGallery.filterByTags();
            }

        },

        filterByTags: function() {
            var numTags = mapGallery.selectedTags.length;

            if (numTags === 0) {
                mapGallery.filters.tag = '';
                $('.tag-list-inline').addClass('hide');
            } else {
                mapGallery.filters.tag = '.tag-' + mapGallery.selectedTags.join('.tag-');
            }

            mapGallery.filter();
        },

        filter: function() {
            mapGallery.locationHash();
        },

        clearFilters: function(e) {
            e.preventDefault();

            mapGallery.filters.bureau = '*';
            mapGallery.filters.tag = '';
            mapGallery.filters.status = '.data-live';

            mapGallery.sortList.sortBy = 'date';
            mapGallery.sortList.sortAscending = false;

            $('.map-status')
                .find('.active')
                .removeClass('active')
                .end()
                .find('.btn').eq(1).addClass('active');

            if ($('.tag-list-inline').is(':visible')) {
                $('.tag-list-inline')
                    .find('li')
                    .remove()
                    .end()
                    .addClass('hide');
            }

            mapGallery.locationHash();
        },

        locationHash: function() {
            var filters = 'filter=' + mapGallery.filters.bureau,
                status = 'status=' + mapGallery.filters.status,
                tags = 'tags=' + mapGallery.filters.tag,
                sortBy = 'sortBy=' + mapGallery.sortList.sortBy + '&sortAscending=' + mapGallery.sortList.sortAscending;

            location.hash = encodeURIComponent(filters) + '&' + encodeURIComponent(status) + '&' + encodeURIComponent(tags) + '&' + encodeURIComponent(sortBy);
        },

        getHashFilter: function() {
            var hash = decodeURIComponent(location.hash),
                bureauHash = hash.match(/filter=([^&]+)/i),
                statusHash = hash.match(/status=([^&]+)/i),
                tagHash = hash.match(/tags=([^&]+)/i),
                sortByHash = hash.match(/sortBy=([^&]+)/i),
                sortAscHash = hash.match(/sortAscending=([^&]+)/i);

            mapGallery.filters.bureau = bureauHash === null ? mapGallery.filters.bureau : bureauHash[1];
            mapGallery.filters.status = bureauHash === null ? mapGallery.filters.status : statusHash[1];
            mapGallery.filters.tag = tagHash === null ? mapGallery.filters.tag : tagHash[1];
            mapGallery.sortList.sortBy = sortByHash === null ? mapGallery.sortList.sortBy : sortByHash[1];
            mapGallery.sortList.sortAscending = sortAscHash === null ? mapGallery.sortList.sortAscending : sortAscHash[1];
            mapGallery.sortList.sortAscending = mapGallery.sortList.sortAscending === 'true';
        },

        onHashchange: function() {

            var filters = '';

            mapGallery.getHashFilter();

            filters = mapGallery.filters.bureau + mapGallery.filters.status + mapGallery.filters.tag;
console.log(filters)         ;
            mapGallery.isIsotopeInit = true;

            $('.map-cards')
                .isotope({
                    filter: filters,
                    sortBy: mapGallery.sortList.sortBy,
                    sortAscending: mapGallery.sortList.sortAscending
                })
                .isotope('updateSortData');

            for (var k in mapGallery.filterOpts) { console.log(k);
                if (mapGallery.filterOpts[k] === mapGallery.filters.bureau) { 
                    $('#sel-filter').val(k);
                }
            }

            for (var i in mapGallery.sortOpts) {
                if (mapGallery.sortOpts[i].sortBy === mapGallery.sortList.sortBy && mapGallery.sortOpts[i].sortAscending === mapGallery.sortList.sortAscending) {
                    $('#sel-sort').val(i);
                }
            }

            console.log(mapGallery.filters.status);

            $('.map-status')
                .find('.active')
                .removeClass('active')
                .end()
                .find('.btn')
                .each(function(index, element) {
                    var btn = $(element),
                        btnAttr = btn.attr('data-filter'),
                        btnClass = '.' + btnAttr;
                    

                    if (mapGallery.filters.status === btnClass) { console.log(btnClass);
                        btn.addClass('active');
                    }

                });

            /*console.log('selected tags = ' + mapGallery.selectedTags);

            var selectedTags = mapGallery.filters.tag.split('.');
            var numTags = selectedTags.length - 1;

            selectedTags.shift();

            var LI = '';

            for (var j = 0; j < numTags; j++) {
                LI += '<li class="tag"><span data-tag="' + selectedTags[j] + '">' + selectedTags[j] + '<a class="link-removeTag" href="#void"><span class="icon icon-remove"></span></span></a></li>';

                if (mapGallery.selectedTags.indexOf(selectedTags[j]) < 0) {
                    mapGallery.selectedTags.push(selectedTags[j].split('tag-')[1]);
                }
            }

            console.log(mapGallery.selectedTags);

            if (!$('.tag-list-inline').is(':visible')) {
                $('.tag-list-inline').removeClass('hide');
            }

            $('.tag-list-inline').find('ul').append(LI);*/

        }
    };

    mapGallery.init();

    $(window).on('hashchange', mapGallery.onHashchange);
    // trigger event handler to init Isotope
    mapGallery.onHashchange();


}(window, document, jQuery));
