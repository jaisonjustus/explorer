require.config({
  shim: {
  },

  paths: {
      jquery:               '../components/jquery/jquery'
    , 'jquery.ui.widget':   'vendor/jquery.ui.widget'
    , 'jquery.fileupload':  'vendor/jquery.fileupload' 
    , underscore:           '../components/lodash/lodash'
    , backbone:             '../components/backbone-amd-lodash/backbone'
    , store:                '../components/store.js/store'
    , bootstrap:            '../components/bootstrap/docs/assets/js/bootstrap'
    , nanoscroller:         '../components/nanoscroller/bin/javascripts/jquery.nanoscroller'
    , settings:             'models/settings'
    , access:               '../components/backbone.pryv/models/access'
    , channel:              '../components/backbone.pryv/models/channel'
    , event:                '../components/backbone.pryv/models/event'
    , folder:               '../components/backbone.pryv/models/folder'
    , duration_event:       '../components/backbone.pryv/models/duration_event'
    , accesses:             '../components/backbone.pryv/collections/accesses'
    , events:               '../components/backbone.pryv/collections/events'
    , folders:              '../components/backbone.pryv/collections/folders'
    , channels:             '../components/backbone.pryv/collections/channels'
    , landing:              'views/landing'
    , explorer:             'views/explorer'
    , token:                'views/token'
    , modal:                'views/modal'
    , state:                '../components/backbone.pryv/models/state' 
    , pryv:                 '../components/backbone.pryv/pryv'
    , tpl:                  '../components/requirejs-tpl/tpl'
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
