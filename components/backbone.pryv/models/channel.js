define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    /* Variables. */
    /* Methods. */
    , initialize: function(){
      var id = this.get('id');
    } 
    , url: function(){
      var url = this.collection.baseApiUrl+'/channels';
      var id = this.get('id');
      if (id){
        url+='/'+id;
      }
      url += '?auth='+encodeURIComponent(this.collection.token);
      return url;
    } 
  });

});
