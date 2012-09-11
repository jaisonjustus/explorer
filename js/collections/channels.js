(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channels = Backbone.Collection.extend({
    model: window.app.Channel
    , initialize: function(){
      //showlog('Channels:initialize');
    } 
    , url: function(){
      return window.app.baseApiUrl+'/admin/channels';
    }
    , sync: function(method, model, options){
      showlog('Channels:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.sessionID);
        }
      });
      Backbone.sync(method, model, options);
    }
  });

})();
