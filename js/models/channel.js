(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    , initialize: function(){
      var id = this.get('id');
      //showlog('Channel:initialize',id);
      /* Create collections. */
      this.folders = new window.app.Folders( [], {channelId:id, parentId: id } );
      this.events = new window.app.Events( [], { channelId:id, parentId: id } );
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
