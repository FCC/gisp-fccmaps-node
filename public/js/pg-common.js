'use strict';

// toggle off canvas right sidebar nav on small screens
var offCanvasMenu = {
    init: function() {

        $('#menu-primary').on('click', 'a', offCanvasMenu.toggleNav);
        $('.btn.hamburger').on('click', offCanvasMenu.toggleMenu);

        $(window)
            .on('resize', offCanvasMenu.resizeWin)
            .resize();

    },
    resizeWin: function() {
        var browseBy = $('.nav-browseBy'),
            btnVisible = $('.btn.hamburger').is(':visible');

        if (btnVisible) {
            $('.nav-secondary').find('nav').prepend(browseBy);

        } else {
            $('.nav-primary').append(browseBy);
        }
    },
    toggleMenu: function(e) {
        e.preventDefault();

        $('body').toggleClass('js-nav');
    },
    toggleNav: function(e) {
        var target = $(this).attr('href'),
            parent = $(this).closest('li'),
            pointer = $('#menu-primary').find('.pointer');

        e.preventDefault();

        $('#menu-primary').find('.active').removeClass('active');
        parent.addClass('active');
        $(this).append(pointer);

        $('.js-browseBy').addClass('hide');
        $(target).removeClass('hide');
    }
};

// display alert when browsing to external sites
var extLinks = function(e) {

    var alertText = 'You are about to leave the FCC website and visit a third-party, non-governmental website that the FCC does not maintain or control. The FCC does not endorse any product or service, and is not responsible for, nor can it guarantee the validity or timeliness of the content on the page you are about to visit. Additionally, the privacy policies of this third-party page may differ from those of the FCC.',
        confirm = window.confirm(alertText);

    if (!confirm) {
        e.preventDefault();
    }

};

// Create Share and Embed links 
var shareLinks = {

    init: function() {

        $('.share-links')
            .on('click', '#btn-bookmark', shareLinks.bookmarkLink)
            .on('click', '#btn-embed', shareLinks.embedLink)
            .on('click', '#btn-closeShare', shareLinks.close);
    },

    bookmarkLink: function(e) {
        var bookmarkLink = window.location;

        e.preventDefault();

        $('#linkShare').slideDown();
        $('#txt-link').val(bookmarkLink).select();
        $('.help-block').addClass('hide');
    },

    embedLink: function(e) {
        var url = window.location.href.split('#');
        var embedLink = '';
        var iFrame = $('#map-details').find('iframe');

        e.preventDefault();	

        if (iFrame.length > 0) {
            embedLink = url[0] + 'embed/';
            $('.help-block').addClass('hide');
        } else {            

            if (url[1] === undefined) { 
                embedLink = url[0] + 'embed/#' + mapLayers.data.init.zoom + '/' + mapLayers.data.init.lat + '/' + mapLayers.data.init.lon + '/zoom,search,layers,attr,key';
            } else {
                embedLink = url[0] + 'embed/#' + url[1].replace(/\/?$/, '/') + 'zoom,search,layers,attr,key';    
            }
            
            $('.help-block').removeClass('hide');
        }
		
        $('#linkShare').slideDown();

        $('#txt-link')
            .click(function() {
                this.select();
            })
            .val(embedLink).select();
    },

    close: function(e) {
        e.preventDefault();
        $('#linkShare').slideUp();
    }
};

$(document).ready(function() {
    offCanvasMenu.init();
    $('body').on('click', '.link-ext', extLinks);
});
