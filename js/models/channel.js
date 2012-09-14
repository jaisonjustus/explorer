(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    , initialize: function(){
      //showlog('Channel:initialize',this.get('id'));
      /* Create event collection. */
      this.events = new window.app.Events(
        [], 
        { contextId: this.get('id') }
      );
    } 
    , sync: function(method, model, options){
      showlog('Channel:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.sessionID);
        }
      });
      Backbone.sync(method, model, options);
    }
  });

})();
