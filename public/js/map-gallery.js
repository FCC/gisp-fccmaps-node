(function (window, document, $) {
  'use strict'

  var MapGallery = {
    searchAPI: './api.json',
        // q = query string
        // st = status
        // bo = bureau
        // id = map ID
        // o = order
    searchQuery: {
      q: '',
      st: 'current',
      o: 'date,desc',
      bo: ''
    },

    init: function () {
            // MapGallery.getData();
      MapGallery.getBureauFilters()
      MapGallery.initGrid()

      $('.search-filters')
                .on('click', '#btn-search', MapGallery.search)
                .on('change', '#sel-filter', MapGallery.filterByBureau)
                .on('click', '.map-status .btn', MapGallery.filterByStatus)
                .on('change', '#sel-sort', MapGallery.sortBy)
                .on('click', '#btn-resetFilters', MapGallery.clearFilters)

      $('#txt-search').on('keypress', function (e) {
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
          MapGallery.search(e)
          return false
        } else {
          return true
        }
      })

      $(window).on('hashchange', MapGallery.onHashchange)

            // trigger event handler to init Isotope
      MapGallery.onHashchange()

            // add tabindex to enforce order
      $('#skip-link, header, .nav-secondary').find('a').add('.navbar-about').attr('tabindex', 10)
      $('.search-filters').find('input, button, select, a').add('.gallery__numResults').attr('tabindex', 20)
    },

    initGrid: function () {
      var $grid = $('.map-cards')
                .isotope({
                  masonry: {
                    columnWidth: '.card',
                    gutter: 20
                  },
                  itemSelector: '.card'
                })
                .on('click', '.btn-details', MapGallery.showCardDetails)

      $grid.imagesLoaded().progress(function () {
        $grid.isotope('layout')
      })
    },

    getData: function () {
            // clear search results
      $('#map-list-holder').html('')
      MapGallery.toggleAlert('hide')

      $.ajax({
        data: MapGallery.searchQuery,
        dataType: 'json',
        success: function (data) {
          MapGallery.createMapCard(data)
          MapGallery.updateResults()
          MapGallery.showNumResults()
        },
        type: 'GET',
        url: MapGallery.searchAPI
      }).fail(function () {
        MapGallery.toggleAlert('show')
      })
    },

        // populate bureau filter dropdown
    getBureauFilters: function () {
      var options = ''
      var bureaus = []
      var bureauFilters = []

      $.ajax({
        dataType: 'json',
        success: createBureauList,
        type: 'GET',
        url: MapGallery.searchAPI
      })

            // create list of unique bureau ID's
      function uniqueBureau (arr) {
        var uniqueBureaus = []
        var dupes = {}

        $.each(arr, function (i, el) {
          if (!dupes[el.id]) {
            dupes[el.id] = true
            uniqueBureaus.push(el)
          }
        })

                // sort by alphabetical order
        function compare (a, b) {
          if (a.id < b.id) {
            return -1
          }
          if (a.id > b.id) {
            return 1
          }
          return 0
        }

        uniqueBureaus.sort(compare)

        return uniqueBureaus
      }

      function createBureauList (data) {
        for (var i = 0; i < data.length; i++) {
          bureaus.push(data[i].meta.bureau)
        }

        bureauFilters = uniqueBureau(bureaus)

        for (var k = 0; k < bureauFilters.length; k++) {
          options += '<option value="' + bureauFilters[k].id + '">' + bureauFilters[k].name + '</option>'
        }

        $('#sel-filter')
                    .find('option:not(:first-child)').remove()
                    .end()
                    .find('option:first-child').after(options)
      }
    },

    search: function (e) {
            // MapGallery.searchQuery.q = $('#txt-search').val();

      MapGallery.searchQuery = {
        q: $('#txt-search').val().trim().replace(/\s\s+/g, ' '),
        st: 'all',
        o: 'date,desc',
        bo: ''
      }

      e.preventDefault()
      $('#txt-search').val(MapGallery.searchQuery.q)
      MapGallery.toggleAlert('hide')
      MapGallery.locationHash()
    },

    createMapCard: function (mapData) {
      var maps = {}
      var source = $('#card-template').html()
      var template, cardList

      Handlebars.registerHelper('isIframe', function (map_type, options) {
        if (map_type === 'layers') {
          return options.fn(this)
        }
        return options.inverse(this)
      })

      // Redirect map type
      // If map_type is undefined, url.web as the map link
      Handlebars.registerHelper('isRedirect', function (map_type, options) {
        if (map_type === undefined) {
          return options.fn(this)
        }
        return options.inverse(this)
      })

      Handlebars.registerHelper('thumbImg', function (map_id, options) {
        return map_id + '/thumb'
      })

      Handlebars.registerHelper('formatDate', function (dateReviewed) {
        if (dateReviewed) {
          var dateStr = dateReviewed.split(' ')[0].split('-')
          var MM = dateStr[1]
          var DD = dateStr[2]
          var YYYY = dateStr[0]

          return (MM + '/' + DD + '/' + YYYY)
        } else {
          return ''
        }
      })

      template = Handlebars.compile(source)

      maps.cards = mapData
      cardList = template(maps)

            // update isotope with new cards
      $('.map-cards')
                .isotope('insert', $(cardList))
                .isotope('layout')
    },

    updateResults: function () {
      var idx = 100
      var numResults = $('.map-cards').find('.card').length

      if (numResults === 0) {
        MapGallery.toggleAlert('show')
      }

      $('.gallery__numResults')
                .html('Showing: ' + numResults + ' maps')

      $('.card').removeAttr('tabindex')

            // add tabindex to enforce tab order
      $('.map-cards').find('li').each(function (index, element) {
        idx = idx + 10 + index

        $(element)
                    .attr('tabindex', idx)
                    .add()
                    .find('a, button').attr('tabindex', idx)
                    .end()
                    .find('.link-viewMore').attr('tabindex', idx + 1)
      })
    },

    toggleAlert: function (isShown) {
      $('.alert-noResults').toggleClass('hide', (isShown !== 'show'))
    },

    showCardDetails: function (e) {
      var thisBtn = $(this),
        thisCard = thisBtn.closest('.card'),
        thisCardBody = thisCard.find('.card__body')

      e.preventDefault()

      if (thisCardBody.is(':visible')) {
        thisBtn
                    .html('<span class="icon icon-caret-right"></span>View details')
                    .attr('aria-expanded', false)

        thisCardBody.slideUp(function () {
          thisCardBody.attr('aria-hidden', true)
          $('.map-cards').isotope('layout')
        })
      } else {
        thisBtn
                    .html('<span class="icon icon-caret-down"></span>Hide details')
                    .attr('aria-expanded', true)

        thisCardBody.slideDown({
          start: function () {
            thisCardBody.attr('aria-hidden', false)
            $('.map-cards').isotope('layout')
          }
        })
      }
    },

    showNumResults: function () {
      $('.gallery__numResults').focus()
    },

    sortBy: function () {
      var selectedVal = $(this).find(':selected').attr('data-value')

      MapGallery.searchQuery.o = selectedVal
      MapGallery.locationHash()
    },

    filterByBureau: function () {
      var selectedVal = this.value

      MapGallery.toggleAlert('hide')
      MapGallery.searchQuery.bo = selectedVal === 'all' ? '' : selectedVal
      MapGallery.locationHash()
    },

    filterByStatus: function () {
      $('.map-status').find('.active').removeClass('active')
      $(this).addClass('active')

      MapGallery.searchQuery.st = $(this).attr('data-filter')
      MapGallery.toggleAlert('hide')
      MapGallery.locationHash()
    },

    clearFilters: function (e) {
      e.preventDefault()

      MapGallery.toggleAlert('hide')

      MapGallery.searchQuery = {
        q: '',
        st: 'current',
        o: 'date,desc',
        bo: ''
      }

      $('#txt-search').val('')
      $('#sel-filter').find(':first-child').prop('selected', true)
      $('#sel-sort').find(':first-child').prop('selected', true)

      $('.map-status')
                .find('.active')
                .removeClass('active')
                .end()
                .find('.btn').eq(1).addClass('active')

      MapGallery.locationHash()
    },

    locationHash: function () {
      location.hash = encodeURIComponent($.param(MapGallery.searchQuery))
    },

    getHashFilter: function () {
      var hash = decodeURIComponent(location.hash)
      var queryHash = hash.match(/q=([^&]+)/i)
      var statusHash = hash.match(/st=([^&]+)/i)
      var bureauHash = hash.match(/bo=([^&]+)/i)
      var sortHash = hash.match(/o=([^&]+)/i)

      MapGallery.searchQuery.q = queryHash === null ? MapGallery.searchQuery.q : decodeURIComponent(queryHash[1].replace(/\+/g, '%20'))
      MapGallery.searchQuery.st = statusHash === null ? MapGallery.searchQuery.st : decodeURIComponent(statusHash[1])
      MapGallery.searchQuery.bo = bureauHash === null ? MapGallery.searchQuery.bo : decodeURIComponent(bureauHash[1])
      MapGallery.searchQuery.o = sortHash === null ? MapGallery.searchQuery.o : decodeURIComponent(sortHash[1])
    },

    onHashchange: function () {
      MapGallery.getHashFilter()
      MapGallery.getData()

      $(document).ajaxStop(function () {
        var boVal = MapGallery.searchQuery.bo === '' ? 'all' : MapGallery.searchQuery.bo

        var searchVal = MapGallery.searchQuery.q
        var statusBtn = '[data-filter="' + MapGallery.searchQuery.st + '"]'
        var bureauVal = 'option[value="' + boVal + '"]'
        var sortVal = 'option[data-value="' + MapGallery.searchQuery.o + '"]'

        $('.map-status')
                    .find('.active')
                    .removeClass('active')

        $('#txt-search').val(searchVal)
        $(statusBtn).addClass('active')
        $('#sel-filter').find(bureauVal).prop('selected', true)
        $('#sel-sort').find(sortVal).prop('selected', true)
      })
    }
  }

  MapGallery.init()
}(window, document, jQuery))
