'use strict';
(function() {

    var autoCollapsed = false;
    $('.nav-collapse').on('click', function() {
        autoCollapsed = false;
        $('body').toggleClass('docs-collapsed-nav');
    });

    /* collapse sidebar when necessary */
    var checkNav = function() {
        var collapsed = $('body').hasClass('docs-collapsed-nav'),
            width = $(this).width();

        if (width <= 767 && !collapsed) {
            autoCollapsed = true;
            $('body').addClass('docs-collapsed-nav');
        } else if (width > 767 && autoCollapsed) {
            $('body').removeClass('docs-collapsed-nav');
        }
    };

    // $(window).on('resize', checkNav);
    // $(document).on('ready', checkNav);

    var resizeSidebar = function() {
        var sectHeight = $('.row-grid').height();

        $('.docs-sidebar').css('height', sectHeight);
    };

    $(window)
        .on('resize', checkNav)
        .on('resize', resizeSidebar);

    $(document)
        .on('ready', checkNav)
        .on('ready', resizeSidebar);


    /* enable tooltips */
    $('[data-toggle="tooltip"]').tooltip({ container: 'body', delay: { show: 200, hide: 0 } });

    $('.link-tags').click(function(e) {
        var thisLink = $(this),
            tagsList = $('.list-tags');

        e.preventDefault();

        if (tagsList.is(':visible')) {
            tagsList
                .addClass('hide')
                .attr('aria-hidden', true);
                
            thisLink.text('View Tags');
            thisLink.attr('aria-expanded', false);
        } else {
            tagsList
                .removeClass('hide')
                .attr('aria-hidden', false);

            thisLink.text('Hide Tags');
            thisLink.attr('aria-expanded', true);
        }
    });

    var scrolled = 0;

    $('.btn-scrollUp').click(function() {

        var pos = $('.nav.nav-stacked').scrollTop();

        if (pos === 0) {
            // console.log('top of the div');
            // scrolled = 0;
        } else {
            scrolled = $('.nav.nav-stacked').scrollTop() - 200;

            $('.nav.nav-stacked').animate({
                scrollTop: scrolled
            });
        }

    });

    $('.btn-scrollDown').click(function() {

        var pos = $('.nav.nav-stacked').scrollTop();

        if (pos + $('.nav.nav-stacked').innerHeight() >= $('.nav.nav-stacked')[0].scrollHeight) {
            // console.log('end reached');
            // scrolled = 0;
        } else {
            scrolled = $('.nav.nav-stacked').scrollTop() + 200;

            $('.nav.nav-stacked').animate({
                scrollTop: scrolled
            });
        }
    });    
})();
