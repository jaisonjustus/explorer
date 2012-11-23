require.config({
  shim: {
  },

  paths: {
      jquery:               'vendor/jquery.min'
    , 'jquery.ui.widget':   'vendor/jquery.ui.widget'
    , 'jquery.fileupload':  'vendor/jquery.fileupload' 
    , underscore:           '../components/lodash/lodash'
    , backbone:             '../components/backbone-amd-lodash/backbone'
    , store:                '../components/store.js/store'
    , bootstrap:            '../components/bootstrap/docs/assets/js/bootstrap'
    , nanoscroller:         '../components/nanoscroller/bin/javascripts/jquery.nanoscroller'
    , settings:             'models/settings'
    , access:               '../components/backbone.pryv/lib/models/access'
    , channel:              '../components/backbone.pryv/lib/models/channel'
    , event:                '../components/backbone.pryv/lib/models/event'
    , folder:               '../components/backbone.pryv/lib/models/folder'
    , duration_event:       '../components/backbone.pryv/lib/models/duration_event'
    , accesses:             '../components/backbone.pryv/lib/collections/accesses'
    , events:               '../components/backbone.pryv/lib/collections/events'
    , folders:              '../components/backbone.pryv/lib/collections/folders'
    , channels:             '../components/backbone.pryv/lib/collections/channels'
    , token_channels:       '../components/backbone.pryv/lib/collections/token_channels'
    , session_channels:     '../components/backbone.pryv/lib/collections/session_channels'
    , landing:              'views/landing'
    , explorer:             'views/explorer'
    , admin:                'views/admin'
    , token:                'views/token'
    , state:                '../components/backbone.pryv/lib/models/state' 
  }
});
 
require(['jquery', 'backbone', 'app'], function($, Backbone, App) {
  /* Centralised AJAX error handling */
  $(function(){
    $(document).ajaxError(function(e, xhr, settings, exception){
      console.log(xhr.status, xhr.responseText);
    });
  });

  new App();

  /* Make correct url root. Backbone only creates the history when 
     at least one route is specified. */
  Backbone.history.start({root:'/'+window.location.pathname});  
});
