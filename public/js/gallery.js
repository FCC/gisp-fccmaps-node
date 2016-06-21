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
            bo: '',
            o: 'date,desc'
        },

        init: function() {
            MapGallery.getData();
            MapGallery.getBureauFilters();
            MapGallery.initGrid();

            $('.search-filters')
            	.on('click', '#btn-search', MapGallery.search)
            	.on('change', '#sel-filter', MapGallery.filterByBureau)
            	.on('click', '.map-status .btn', MapGallery.filterByStatus)
            	.on('change', '#sel-sort', MapGallery.sortBy)
            	.on('click', '#btn-resetFilters', MapGallery.clearFilters);
            
            // $('#btn-search').on('click', MapGallery.search);
            // $('#sel-filter').on('change', MapGallery.filterByBureau);
            // $('.map-status').on('click', '.btn', MapGallery.filterByStatus);
            // $('#sel-sort').on('change', MapGallery.sortBy);
            // $('#btn-resetFilters').on('click', MapGallery.clearFilters);

            $('#txt-search').on('keypress', function(e) {
                if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
                    MapGallery.search(e);
                    return false;
                } else {
                    return true;
                }
            });
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

            $.ajax({                
                data: MapGallery.searchQuery,
                dataType: 'json',
                success: function(data) {
                    MapGallery.createMapCard(data);

                    MapGallery.updateResults(data.length);
                    MapGallery.showNumResults();                    
                },
                type: 'GET',
                url: MapGallery.searchAPI
            });
        },

        // populate bureau filter dropdown
        getBureauFilters: function() {
            var options = '';
            var bureaus = [];
            var bureauFilters = [];

            $.ajax({
                dataType: 'json',
                success: createBureauList,
                type: 'GET',
                url: MapGallery.searchAPI
            });

            // create list of unique bureau ID's
            function uniqueBureau(arr) {
                var uniqueBureaus = [];
                var dupes = {};

                $.each(arr, function(i, el) {
                    if (!dupes[el.id]) {
                        dupes[el.id] = true;
                        uniqueBureaus.push(el);
                    }
                });

                // sort by alphabetical order
                function compare(a, b) {
                    if (a.id < b.id)
                        return -1;
                    if (a.id > b.id)
                        return 1;
                    return 0;
                }

                uniqueBureaus.sort(compare);

                return uniqueBureaus;
            }

            function createBureauList(data) {

                for (var i = 0; i < data.length; i++) {
                    bureaus.push(data[i].meta.bureau);
                }

                bureauFilters = uniqueBureau(bureaus);

                for (var k = 0; k < bureauFilters.length; k++) {
                    options += '<option value="' + bureauFilters[k].id + '">' + bureauFilters[k].name + '</option>';
                }

                $('#sel-filter')
                    .find('option:not(:first-child)').remove()
                    .end()
                    .find('option:first-child').after(options);
            }

        },

        search: function(e) {
            MapGallery.searchQuery.q = $('#txt-search').val();
            e.preventDefault();
            MapGallery.toggleAlert('hide');
            MapGallery.getData();
        },

        createMapCard: function(mapData) {
            var date = '';
            var maps = {};
            var source = $('#card-template').html();

            Handlebars.registerHelper('isIframe', function(map_type, options) {
                if (map_type === 'layers') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            Handlebars.registerHelper('formatDate', function(dateReviewed, options) {
                return dateReviewed.split(' ')[0];
            });

            var template = Handlebars.compile(source);

            maps.cards = mapData;
            var cardList = template(maps);

            //$('#map-list-holder').html(cardList);

            $('.map-cards').isotope('insert', $(cardList));
            $('.map-cards').isotope('layout');

            // date = $('.data-date').text().split(' ')[0];
            // $('.data-date').text(date);
        },

        updateResults: function(numResults) {
            var idx = 100;

            if (numResults === 0) {
                MapGallery.toggleAlert('show');
            }

            $('.gallery__numResults')
                .html('Showing: ' + numResults + ' maps');

            $('.card').removeAttr('tabindex');

            // add tabindex to enforce tab order
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

        sortBy: function() {
            var selectedVal = $(this).find(':selected').attr('data-value');

            MapGallery.searchQuery.o = selectedVal;

            // MapGallery.locationHash();
            MapGallery.getData();
        },

        filterByBureau: function() {
            var selectedVal = this.value;

            MapGallery.toggleAlert('hide');
            MapGallery.searchQuery.bo = selectedVal === 'all' ? '' : selectedVal;
            MapGallery.getData();
        },

        filterByStatus: function() {
            $('.map-status').find('.active').removeClass('active');
            $(this).addClass('active');

            MapGallery.searchQuery.st = $(this).attr('data-filter');
            MapGallery.toggleAlert('hide');
            MapGallery.getData();
        },
        clearFilters: function(e) {
            e.preventDefault();

            MapGallery.toggleAlert('hide');

            MapGallery.searchQuery = {
                q: '',
                st: 'active',
                bo: '',
                o: 'date,desc'
            };

            $('#txt-search').val('');
            $('#sel-filter').find(':first-child').prop('selected', true);
            $('#sel-sort').find(':first-child').prop('selected', true);

            $('.map-status')
                .find('.active')
                .removeClass('active')
                .end()
                .find('.btn').eq(1).addClass('active');

            // MapGallery.locationHash();
            MapGallery.getData();
        }
    };

    MapGallery.init();

}(window, document, jQuery));
