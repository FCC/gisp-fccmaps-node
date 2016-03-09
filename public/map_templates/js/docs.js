'use strict';
(function() {

    /*
     * Add toggle code functionality
     */
    /*$('.pl-preview').each(function() {
        var el = $(this);
        var next = el.next('.highlight');
        var toggle;
        if (next.length) {
            toggle = $('<div class="pl-toggle-code"><i class="icon icon-code"></i> View source</div>');
            toggle.prependTo(el);
            toggle.on('click', function() {
                next.slideToggle(250);
                toggle.toggleClass('active');
            });
        }
    });*/

    /*
     * Add collapsible panel functionality
     */
    var collapseOne = $('#3collapseOne');
    var collapseTwo = $('#3collapseTwo');
    var collapseThree = $('#3collapseThree');
    $('#collapse-all').click(function() {
        collapseOne.collapse('hide');
        collapseTwo.collapse('hide');
        collapseThree.collapse('hide');
    });

    $('#expand-all').click(function() {
        collapseOne.collapse('show');
        collapseTwo.collapse('show');
        collapseThree.collapse('show');
    });

    /*
     * Setup sidebar active link
     */
    $('.docs-sidebar >.nav > li').each(function() {
        var navItem = $(this);
        if (navItem.find('a').attr('href') === location.pathname) {
            navItem.addClass('active');
        }
    });

    /*
     * Add subnav
     */
    var activeSubNav = $('.docs-sidebar > .nav > .active');
    var newList = $('<ul class="nav nav-stacked"></ul>');
    $('.pl-pattern > h3').each(function() {
        var el = $(this);
        if (el.attr('id')) {
            var li = $('<li><a href="#' + el.attr('id') + '">' + el.text() + '</a></li>');
            newList.append(li);

        }
    });
    if (newList.children().length) {
        activeSubNav.append(newList);
    }

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

    $(window).on('resize', checkNav);
    $(document).on('ready', checkNav);

    var resizeSidebar = function() { console.log('reszieSide');
        var sectHeight = $('.row-grid').height();

        $('.docs-sidebar').css('height', sectHeight);
    };

    $(window).on('resize', resizeSidebar);
    $(document).on('ready', resizeSidebar);


    /*
     * Use bootstrap's scrollspy plugin to highlight subnav based on scroll position
     */
    $('body').scrollspy({ target: '.docs-sidebar > .nav > .active', offset: 120 });

    /* animate scrolling to the sidebar sublink targets to ensure proper offsets */
    $('.docs-sidebar > .nav > .active > .nav > li > a').on('click', function() {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 110
        }, 200);
    });

    /* enable tooltips */
    $('[data-toggle="tooltip"]').tooltip({ container: 'body', delay: { show: 200, hide: 0 } });


    var scrolled = 0;

    $('.btn-scrollUp').click(function() {       

        var pos = $('.nav.nav-stacked').scrollTop();

        if (pos === 0) {
            // console.log('top of the div');
            // scrolled = 0;
        } else {
            scrolled = $('.nav.nav-stacked').scrollTop() - 300;

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
            scrolled = $('.nav.nav-stacked').scrollTop() + 300;

            // console.log($('.nav.nav-stacked').scrollTop());

            $('.nav.nav-stacked').animate({
                scrollTop: scrolled
            });
        }
    });

    /*$('.nav.nav-stacked').on('scroll', function() {
        var pos = $(this).scrollTop();

        if (pos + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            console.log('end reached');
            scrolled = 0;
        }
        
        if (pos === 0) {
            console.log('top of the div');
            scrolled = 0;
        }
    });*/

})();
