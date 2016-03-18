
(function(window, document, $) {
    'use strict';

    $('.map-cards').isotope({
        masonry: {
            columnWidth: 265,
            gutter: 25
        },
        getSortData: {
            date: '.data-date',
            cardTitle: '.card__title'
        },
        itemSelector: '.card',
        sortBy: 'date',
        sortAscending: false
    });
    
    $('#sel-sort').change(function() {

        var selectedVal = this.value;

        var sortOpts = {
            dateAsc: {
                sortBy: 'data-date',
                sortAscending: true
            },
            dateDesc: {
                sortBy: 'data-date',
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
    });

    $('#sel-filter').change(function() {

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

        $('.map-cards')	        
	        .isotope(filterOpts[selectedVal])
	        .isotope('updateSortData').isotope();

    });

    $('.map-cards')
        .on('click', '.btn-details', function() {
            var thisBtn = $(this),
                thisCard = $(this).closest('.card').find('.card__body');

            if (thisCard.is(':visible')) {
                thisBtn.html('<span class="icon icon-caret-right"></span>View details');
                thisCard.slideUp(function() {
                	$('.map-cards').isotope('layout');
                });                
            } else {
                thisBtn.html('<span class="icon icon-caret-down"></span>Hide details');
                thisCard.slideDown(function() {
                	$('.map-cards').isotope('layout');
                });                
            }
        });
        /*.on('click', '.tag a', function(e) {
        	e.preventDefault();
        	console.log('tag');

        	var tag = $(this).attr('data-tag');

        	var newTag = $(this).parent('li').clone().append('<span class="icon icon-remove"></span>');

        	$('.tag-list-inline').append(newTag);

        	 $('.map-cards').isotope({
        	 	filter: '.tag-' + tag
        	 });
        });*/

}(window, document, jQuery));
