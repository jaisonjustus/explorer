define(['underscore', 'backbone', 'folder', 'state'], function(_, Backbone, Folder, state) {
  'use strict';

  return Backbone.Collection.extend({
      model: Folder
    , parentId: '-1'
    , channelId: '-1'
    , token: null
    , baseApiUrl: null
    , initialize: function(models, options){
      //showlog('Folders:initialize',this,options);
      this.parentId = options.parentId;
      this.channelId = options.channelId;
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
    } 
    , url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          //xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      return this.baseApiUrl+'/'+this.channelId+'/folders?state='+state.get('state')+'&auth='+this.token;
    }
  });

});
