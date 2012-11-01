(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
        /* id, folderId */
          comment: null
        , folderId: null
        , value:null
    }
    , url: function(){
      var url = this.collection.baseApiUrl+'/'+this.collection.channelId+'/events';
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

  window.app.DurationEvent = window.app.Event.extend({
    /* Variables. */
      name: 'DurationEvent'
    , duration: null
    /* Methods. */
    , url: function(){
      if (!this.get('id')){
        /* We only override the event creation. */
        return this.collection.baseApiUrl+'/'+this.collection.channelId+'/events/start';
      } else {
        return window.app.Event.prototype.url.call(this);
      }
    } 
  });
})();
