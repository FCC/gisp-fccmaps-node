(function(window, document, $) {
    'use strict';

    var MapGallery = {
        searchAPI: '/api.json',
        // q = query string
        // st = status
        // bo = bureau
        // id = map ID
        // o = order
        searchQuery: { 
        	q: '', 
	        st: 'active',
	        bo: ''
	    },
        init: function() {
            MapGallery.getData();
            MapGallery.initGrid();

            $('#btn-search').on('click', MapGallery.search);
            $('#sel-filter').on('change', MapGallery.filterByBureau);
            $('.map-status').on('click', '.btn', MapGallery.filterByStatus);

            // add tabindex to enforce order
            $('#skip-link, header, .nav-secondary').find('a').add('.navbar-about').attr('tabindex', 10);
            $('.gallery__filterOpts').find('button, select, a').add('.gallery__numResults').attr('tabindex', 20);
        },

        initGrid: function() {
            var $grid = $('.map-cards')
                .isotope({
                    masonry: {
                        columnWidth: '.card',
                        gutter: 20
                    },
                    getSortData: {
                        date: function(itemElem) {
                            return Date.parse($(itemElem).find('.data-date').text());
                        },
                        cardTitle: '.card__title'
                    },
                    itemSelector: '.card',
                    transitionDuration: 0
                })
                // .append(window.allMaps)
                .isotope('insert', window.allMaps)
                // .on('layoutComplete', MapGallery.updateResults)
                // .on('arrangeComplete', MapGallery.showNumResults)
                .on('click', '.btn-details', MapGallery.showCardDetails);

            $grid.imagesLoaded().progress(function() {
                $grid.isotope('layout');
            });
        },

        getData: function() {

            // clear search results
            $('#map-list-holder').html('');
            MapGallery.status = $('.map-status').find('.active').attr('data-filter');

            console.log(MapGallery.status);

            $.ajax(MapGallery.searchAPI, {
                complete: function() {
                    console.log(this.url);
                },
                data: MapGallery.searchQuery,
                dataType: 'json',
                success: function(data) {
                    MapGallery.createMapCard(data);
                    MapGallery.updateResults(data.length);
                    MapGallery.showNumResults();
                    console.log('numResults = ' + data.length);
                },
                type: 'GET',
                url: MapGallery.searchAPI
            });
        },

        search: function(event) {
            MapGallery.searchQuery.q = $('#txt-search').val();
            event.preventDefault();
            MapGallery.toggleAlert('hide');
            MapGallery.getData();
        },

        createMapCard: function(mapData) {
            var maps = {};
            var source = $('#card-template').html();

            Handlebars.registerHelper('isIframe', function(map_type, options) {
                if (map_type === 'layers') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            var template = Handlebars.compile(source);

            maps.cards = mapData;
            var cardList = template(maps);

            //$('#map-list-holder').html(cardList);

            $('.map-cards').isotope('insert', $(cardList));
            $('.map-cards').isotope('layout');

        },

        updateResults: function(numResults) {
            var idx = 100;

            if (numResults === 0) {
                MapGallery.toggleAlert('show');
            }

            $('.gallery__numResults')
                .html('Showing: ' + numResults + ' maps');

            $('.card').removeAttr('tabindex');

            // for (var i = 0; i < numResults; i++) {
            $('.map-cards').find('li').each(function(index, element) {
                idx = idx + 10 + index;

                $(element)
                    .attr('tabindex', idx)
                    .add()
                    .find('a, button').attr('tabindex', idx)
                    .end()
                    .find('.link-viewMore').attr('tabindex', idx + 1);
            });


        },

        toggleAlert: function(isShown) {
            $('.alert-noResults').toggleClass('hide', (isShown !== 'show'));
        },

        showCardDetails: function(e) {
            var thisBtn = $(this),
                thisCard = thisBtn.closest('.card'),
                thisCardBody = thisCard.find('.card__body');

            e.preventDefault();

            if (thisCardBody.is(':visible')) {
                thisBtn
                    .html('<span class="icon icon-caret-right"></span>View details')
                    .attr('aria-expanded', false);

                thisCardBody.slideUp(function() {
                    thisCardBody.attr('aria-hidden', true);
                    thisCardBody.css('z-index', '');
                    $('.map-cards').isotope('layout');
                });
            } else {
                thisBtn
                    .html('<span class="icon icon-caret-down"></span>Hide details')
                    .attr('aria-expanded', true);

                thisCardBody.slideDown(function() {
                    thisCardBody.attr('aria-hidden', false);
                    thisCardBody.css('z-index', 2);
                    $('.map-cards').isotope('layout');
                });
            }
        },

        showNumResults: function() {
            $('.gallery__numResults').focus();
        },

        sorting: function() {
            var selectedVal = this.value;

            mapGallery.sortList.sortBy = mapGallery.sortOpts[selectedVal].sortBy;
            mapGallery.sortList.sortAscending = mapGallery.sortOpts[selectedVal].sortAscending;

            mapGallery.locationHash();

        },

        filterByBureau: function() {
            var selectedVal = this.value;

            MapGallery.searchQuery.bo = selectedVal === 'all' ? '*' : '.bureau-' + selectedVal;
            MapGallery.getData();
        },

        filterByStatus: function() {
            MapGallery.searchQuery.st = $(this).attr('data-filter');
            $('.map-status').find('.active').removeClass('active');
            $(this).addClass('active');
            MapGallery.getData();
        }
    };

    $(document).ajaxStop(function() {


        //$(window).on('hashchange', mapGallery.onHashchange);

        // trigger event handler to init Isotope
        // mapGallery.onHashchange();
    });

    MapGallery.init();
}(window, document, jQuery));
