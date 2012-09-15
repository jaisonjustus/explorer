(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    , initialize: function(){
      showlog('Channel:initialize',this.get('id'));
      var id = this.get('id');
      /* Create collections. */
      this.folders = new window.app.Folders( [], { parentId: id } );
      this.events = new window.app.Events( [], { parentId: id } );
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
