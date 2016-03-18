(function(window, document, $) {
    'use strict';

    var mapGallery = {
        filters: {
            bureau: '',
            tag: ''
        },
        selectedTags: [],

        init: function() {
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
                sortBy: 'date',
                sortAscending: false
            });

            $('.map-cards')
                .on('click', '.btn-details', mapGallery.showCardDetails)
                .on('click', '.tag a', mapGallery.addTag);

            $('#sel-filter').on('change', mapGallery.filterByBureau);
            $('#sel-sort').on('change', mapGallery.sort);

            $('.tag-list-inline').on('click', '.link-removeTag', mapGallery.removeTag);
        },

        showCardDetails: function(e) {
            var thisBtn = $(this),
                thisCard = thisBtn.closest('.card').find('.card__body'),
                thisCardBody = thisBtn.closest('.card').find('.card__body');

            e.preventDefault();
            thisCard.closest('.card').css('z-index', 1);

            if (thisCard.is(':visible')) {
                thisBtn.html('<span class="icon icon-caret-right"></span>View details');
                thisCardBody.slideUp(function() {
                    thisBtn.closest('.card').css('z-index', 0);
                    $('.map-cards').isotope('layout');
                });
            } else {
                thisBtn.html('<span class="icon icon-caret-down"></span>Hide details');
                thisCardBody.slideDown(function() {
                    thisBtn.closest('.card').css('z-index', 0);
                    $('.map-cards').isotope('layout');
                });
            }
        },

        sort: function() {
            var selectedVal = this.value;

            var sortOpts = {
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
            };

            $('.map-cards')
                .isotope(sortOpts[selectedVal])
                .isotope('updateSortData').isotope();
        },

        filterByBureau: function() {
            var selectedVal = this.value;

            var filterOpts = {
                all: {
                    filter: '*'
                },
                MB: {
                    filter: '.bureau-MB'
                },
                WCB: {
                    filter: '.bureau-WCB'
                },
                WTB: {
                    filter: '.bureau-WTB'
                },
                OSP: {
                    filter: '.bureau-OSP'
                },
                OET: {
                    filter: '.bureau-OET'
                }
            };

            mapGallery.filters.bureau = filterOpts[selectedVal].filter;
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
            var filters = mapGallery.filters.tag + mapGallery.filters.bureau;

            $('.map-cards')
                .isotope({
                    filter: filters
                })
                .isotope('updateSortData')
                .isotope();
        }
    };

    mapGallery.init();

}(window, document, jQuery));
