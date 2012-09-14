(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
      /* id, contextId */
        comment: null
      , value:null
    }
    , initialize: function(){
      //showlog('Event:initialize');
    } 
    , sync: function(method, model, options){
      showlog('Channel:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });
      Backbone.sync(method, model, options);
    }
  });

})();
