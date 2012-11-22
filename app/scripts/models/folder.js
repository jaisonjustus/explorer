define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {
      /* id, folderId */
      //   comment: null
      // , folderId: null
      // , value:null
    }
    , initialize: function(){
      var id = this.get('id');
    }
    , url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          //xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      return this.collection.baseApiUrl+'/'+this.collection.channelId+'/folders/'+this.id+'?auth='+this.collection.token;
    }
  });

});
