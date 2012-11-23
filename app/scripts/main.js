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
    , access:               'models/access'
    , channel:              'models/channel'
    , event:                'models/event'
    , folder:               'models/folder'
    , duration_event:       'models/duration_event'
    , accesses:             'collections/accesses'
    , events:               'collections/events'
    , folders:              'collections/folders'
    , channels:             'collections/channels'
    , token_channels:       'collections/token_channels'
    , session_channels:     'collections/session_channels'
    , landing:              'views/landing'
    , explorer:             'views/explorer'
    , admin:                'views/admin'
    , token:                'views/token'
    , state:                'models/state' 
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
