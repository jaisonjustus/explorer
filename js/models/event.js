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
      // showlog('Event:initialize', this);
      this.folderId = this.collection.folderId;
    } 
    , url: function(){
      var url = window.app.baseApiUrl+'/'+this.collection.channelId+'/events';
      var id = this.get('id');
      if (id){
        url += '/'+id;
      }
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.collection.token);
        }, this)
      });
      return url;
    }
  });

})();
