define([
    'backbone'
  , 'store'
  , 'explorer'
  , 'landing'
  , 'settings'
], function(
    Backbone
  , Store
  , ExplorerView
  , LandingView
  , Settings
) {

  'use strict';

  /* Backbone hijacking to get API-Version and Server-Time headers. */
  Backbone._ajax = Backbone.ajax;
  Backbone.ajax = function(){
    Backbone._ajax.apply(this, arguments)
      .success(function(res, status, jqXHR){
        /* https://gist.github.com/706839 */
        function _parseResponseHeaders(headerStr) {
          var headers = {};
          if (!headerStr) {
            return headers;
          }
          var headerPairs = headerStr.split('\u000d\u000a');
          for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];
            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf('\u003a\u0020');
            if (index > 0) {
              var key = headerPair.substring(0, index);
              var val = headerPair.substring(index + 2);
              headers[key] = val;
            }
          }
          return headers;
        }

        var h = _parseResponseHeaders( jqXHR.getAllResponseHeaders() );

        var remoteAPIVersion = h['API-Version'];
        if (remoteAPIVersion !== undefined) {
          localAPIVersion = Store.get('API-Version');
          if (localAPIVersion !== undefined && 
              localAPIVersion !== remoteAPIVersion) {
                console.log('Remote API version is now', remoteAPIVersion);
                /* TODO: Reboot! */
              } else {
                console.log('Remote API version is', remoteAPIVersion);
                Store.set('API-Version', remoteAPIVersion); 
              } 
        }

        var serverTime = h['Server-Time'];
        if (serverTime !== undefined) {
          console.log('Server-Time is', serverTime);
          Store.set('Server-Time', serverTime);
        }
      });
  }

  return Backbone.Router.extend({
    routes: {
      '*filter' : 'setFilter'
    }
    , initialize: function(){
      this.settings = new Settings();
      this.explorerView = new ExplorerView({
          model: this.settings
        , accessesByUsername: {}
      });
    }

    , setFilter: function(param){
      param = param.trim() || '';
      switch(param){
        case 'explorer': 
          this.explorerView.render();
          break;
        default: { 
          new LandingView({model: this.settings}).render();
        }
      }
    }
  });
});
