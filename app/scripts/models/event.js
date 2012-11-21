define(['underscore', 'backbone', 'event'], function(_, Backbone, Event) {
  'use strict';

  return Backbone.Model.extend({
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

});
