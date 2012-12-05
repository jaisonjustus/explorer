define(['underscore', 'backbone', 'event'], function(_, Backbone, Event) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {
        /* id, folderId */
          description: null
        , folderId: null
        , value:null
    }
    , baseUrl: function(){
      var url = this.collection.baseApiUrl+'/'+this.collection.channelId+'/events';
      var id = this.get('id');
      if (id){
        url += '/'+id;
      }
      return url; 
    }
    , fileUrl: function(file){
      return this.baseUrl()+'/'+file+'?auth='+encodeURIComponent(this.collection.token); 
    }
    , url: function(){
      return this.baseUrl()+'?auth='+encodeURIComponent(this.collection.token);
    }
  });

});
