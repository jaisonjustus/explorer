(function(){
  'use strict';
  /* Namespace. */
  window.app = window.app || {};

  $(function(){
    /* Centralised ajax error handling. */
    $(document).ajaxError(function(e, xhr, settings, exception){
      showlog(xhr.status, xhr.responseText);
    });
  });

  /* Backbone hacking to get API-Version and Server-Time headers. */
  Backbone._ajax = Backbone.ajax;
  Backbone.ajax = function(){
    Backbone._ajax.apply(this, arguments)
      .success(function(res, textStatus, jqXHR){

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
          localAPIVersion = store.get('API-Version');
          if (localAPIVersion !== undefined && 
              localAPIVersion !== remoteAPIVersion) {
            showlog('Remote API version is now', remoteAPIVersion);
            /* TODO: Reboot! */
          } else {
            showlog('Remote API version is', remoteAPIVersion);
            store.set('API-Version', remoteAPIVersion); 
          } 
        }

        var serverTime = h['Server-Time'];
        if (serverTime !== undefined) {
          showlog('Server-Time is', serverTime);
          store.set('Server-Time', serverTime);
        }
      });
  }

  /* Router. */
  window.app.App = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    }
    , initialize: function(){
      this.explorerView = new window.app.ExplorerView({});
    }
    , setFilter: function(param){
      //showlog('router:setFilter', param);
      param = param.trim() || '';
      switch(param){
        case 'admin': 
        case 'token':
          this.explorerView.setMode(param).render();
        break;
        default: { 
          new window.app.LandingView({}).render();
        }
      }
    }
  });

  /* Main entry point. */
  new window.app.App();
  /* Make correct root. */
  Backbone.history.start({root:'/'+window.location.pathname}); 

})();
