define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {}
    , initialize: function(){
      var id = this.get('id');
    }
    , url: function(){
      return this.collection.baseApiUrl+'/'+this.collection.channelId+'/folders/'+this.id+'?auth='+encodeURIComponent(this.collection.token);
    }
  });

});
