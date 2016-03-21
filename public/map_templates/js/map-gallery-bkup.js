(function(window, document, $) {
    'use strict';

    var sortOpts = {},
        filterOpts = {},
        allTags = '',
        sortBy = {},
        filterBy = {};

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

    function search() {

        $('.map-cards')
            .isotope(sortBy)            
            .isotope('updateSortData')
            .isotope(filterBy)
            .isotope('updateSortData')
             .isotope({
                filter: allTags
            })
            .isotope('updateSortData').isotope();
    }

    $('#sel-sort').change(function() {

        var selectedVal = this.value;

        sortOpts = {
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

        /*$('.map-cards')
            .isotope(sortOpts[selectedVal])
            .isotope('updateSortData').isotope();*/
        sortBy = sortOpts[selectedVal];
        search();
    });

    $('#sel-filter').change(function() {

        var selectedVal = this.value;

        filterOpts = {
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

        /*$('.map-cards')
            .isotope(filterOpts[selectedVal])
            .isotope('updateSortData').isotope();*/
        filterBy = filterOpts[selectedVal];
        search();

    });

    $('.map-cards')
        .on('click', '.btn-details', function(e) {
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
        });

    var tagFilter = {
        selectedTags: [],
        init: function() {
            $('.map-cards').on('click', '.tag a', this.addTag);

            $('.tag-list-inline').on('click', '.link-removeTag', this.removeTag);
        },
        removeTag: function(e) {
            var $tagLink = $(this),
                $tag = $tagLink.parent('span').attr('data-tag');

            var index = tagFilter.selectedTags.indexOf($tag);
            e.preventDefault();

            tagFilter.selectedTags.splice(index, 1);
            $tagLink.closest('.tag').remove();
            tagFilter.filterByTags();
        },
        addTag: function(e) {
            e.preventDefault();

            var $tagLink = $(this),
                $tag = $tagLink.attr('data-tag'),
                $tagText = $tagLink.text(),
                newTag = $tagLink.parent('li').clone();

            if (tagFilter.selectedTags.indexOf($tag) < 0) {

                tagFilter.selectedTags.push($tag);

                newTag.find('a').replaceWith('<span data-tag="' + $tag + '">' + $tagText + '<a class="link-removeTag" href="#void"><span class="icon icon-remove"></span></span></a>');

                if (!$('.tag-list-inline').is(':visible')) {
                    $('.tag-list-inline').removeClass('hide');
                }

                $('.tag-list-inline').find('ul').append(newTag);

                tagFilter.filterByTags();
            }

        },
        filterByTags: function() {
            // var allTags = '',
               var numTags = this.selectedTags.length;

            if (numTags === 0) {
                allTags = '';
                $('.tag-list-inline').addClass('hide');
            } else {
                allTags = '.tag-' + tagFilter.selectedTags.join('.tag-');
            }

            /*$('.map-cards').isotope({
                filter: allTags
            }).isotope('updateSortData').isotope();*/

            search();
        }

    };

    tagFilter.init();

    var quickSearch = {
        init: function() {
            var qsRegex;

            // init Isotope
            // var $grid = $('.map-cards').isotope({
            //     filter: function() {
            //         return qsRegex ? $(this).text().match(qsRegex) : true;
            //     }
            // });

            

            // debounce so filtering doesn't happen every millisecond
            function debounce(fn, threshold) {
                var timeout;
                return function debounced() {
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    function delayed() {
                        fn();
                        timeout = null;
                    }
                    timeout = setTimeout(delayed, threshold || 100);
                };
            }

            // use value of search field to filter
            var $quicksearch = $('.map-search').keyup(debounce(function() {
                qsRegex = new RegExp($quicksearch.val(), 'gi');
                // $grid.isotope('updateSortData').isotope();
                $('.map-cards').isotope({
                    filter: function() {
                        return qsRegex ? $(this).text().match(qsRegex) : true;
                    }
                }).isotope('updateSortData').isotope();
            }, 200));
        }
    };




    quickSearch.init();

}(window, document, jQuery));
