(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
      /* id, folderId */
        comment: null
      , folderId: ''
      , value:null
    }
    , initialize: function(){
      //showlog('Event:initialize', this);
    } 
    , sync: function(method, model, options){
      showlog('Event:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });
      Backbone.sync(method, model, options);
    }
  });

})();
