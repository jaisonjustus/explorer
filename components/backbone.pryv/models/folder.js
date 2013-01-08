define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
      defaults: {}
    , initialize: function(){
    }
    , url: function(){
      var url = this.collection.baseApiUrl+'/'+this.get('channelId')+'/folders';
      var id = this.get('id');
      if (id) {
        url += '/'+id;
      }
      url += '?auth='+encodeURIComponent(this.collection.token);
      return url;
    }
  });

});
