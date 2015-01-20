(function(gapi){
  geoQuery = {
    init: function(){
      // init map
      L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXMtbGFuZS1jb25rbGluZyIsImEiOiJ3RHBOc1BZIn0.edCFqVis7qgHPRgdq0WYsA';
      var map = L.mapbox.map('map', 'james-lane-conkling.5630f970', {})
        .setView([44.5, 23.0], 9)
        .on('draw:created', this.drawCircle);

      // add draw control to map (only show circle draw button)
      drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          polygon: false,
          rectangle: false,
          marker: false,
          circle: { repeatMode: true }
        }
      }).addTo(map);

      // automatically enable circle draw toolbar hack: https://github.com/Leaflet/Leaflet.draw/issues/179
      for (var toolbarId in drawControl._toolbars) {
        var toolbar = drawControl._toolbars[toolbarId];
        toolbar._modes.circle.handler.enable();
      }

      // add callback for embedly card rendered
      embedly('on', 'card.rendered', function(card){
        // if all cards have been loaded, disable spinner
        geoQuery.unloadedCardsCount --
        if(geoQuery.unloadedCardsCount === 0){
          geoQuery.getSpinner().removeClass('spinner');
        }
      });
    },

    drawCircle: function(e){
      var circle = {center: e.layer._latlng, radius: e.layer._mRadius};
      geoQuery.queryGapi(circle);
    },

    getSpinner: function(){
      return $('#map .right-control');
    },

    queryGapi: function(circle){
      var videoContainer = $('body > div#video-container'),
          map = $('#map'),
          spinner = geoQuery.getSpinner();

      var gapiQuery = gapi.client.youtube.search.list({
        part: 'snippet',
        type: 'video,list',
        location: circle.center.lat + ',' + circle.center.lng,
        locationRadius: circle.radius <= 1000000 ? circle.radius + 'm' : '1000000m',
        maxResults: 5
      });

      videoContainer.addClass('active');
      map.addClass('has-video-container');
      spinner.addClass('spinner');

      gapiQuery.execute(function(response) {
        // save count of returned results (often set by maxResults)
        geoQuery.unloadedCardsCount = response.items.length;
        $.each(response.items, function(idx, item) {
          window.items = [idx, item];
          videoContainer.prepend('<a data-card-chrome="0" href="http://www.youtube.com/watch?v=' + item.id.videoId + '" id="video-' + idx + '"></a>')
          embedly.card('a#video-' + idx)
        })

      });
    }

  };

window.geoQuery = geoQuery;
geoQuery.init();

})(gapi);



