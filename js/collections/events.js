(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
      model: window.app.Event
    , parentId: '-1'
    , channelId: '-1'
    , initialize: function(models, options){
      //showlog('Events:initialize',this,options);
      this.parentId = options.parentId;
      this.channelId = options.channelId;
      this.onlyFolders = [];
    } 
    , url: function(){
      var partialUrl = '';
      if(this.onlyFolders.length){
        partialUrl = '?onlyFolders[]='+this.onlyFolders[0];
        for(var i = 1; i < this.onlyFolders.length; ++i){
          partialUrl += '&onlyFolders[]='+this.onlyFolders[i];
        }
      }
      return window.app.baseApiUrl+'/'+this.channelId+'/events'+partialUrl;
    }
    , sync: function(method, model, options){
      showlog('Events:sync',arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });
      Backbone.sync(method, model, options);
    }
  });

})();

