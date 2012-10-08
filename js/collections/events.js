(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
      model: window.app.Event
    , parentId: '-1'
    , channelId: '-1'
    , token: null
    , baseApiUrl: null
    /* Methods. */
    , initialize: function(models, options){
      this.parentId = options.parentId;
      this.channelId = options.channelId;
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
      this.onlyFolders = options.onlyFolders || [];
    } 
    , url: function(){
      var partialUrl = '';
      if(this.onlyFolders.length){
        partialUrl = '?onlyFolders[]='+this.onlyFolders[0];
        for(var i = 1; i < this.onlyFolders.length; ++i){
          partialUrl += '&onlyFolders[]='+this.onlyFolders[i];
        }
      }
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      return this.baseApiUrl+'/'+this.channelId+'/events'+partialUrl;
    }
  });

})();

