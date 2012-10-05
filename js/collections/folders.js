(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Folders = Backbone.Collection.extend({
      model: window.app.Folder
    , parentId: '-1'
    , channelId: '-1'
    , initialize: function(models, options){
      //showlog('Folders:initialize',this,options);
      this.parentId = options.parentId;
      this.channelId = options.channelId;
    } 
    , url: function(){
      var url = window.app.baseApiUrl+'/'+this.channelId+'/folders';
      if (this.parentId !== this.channelId){
        url += '/'+this.parentId;
      }
      return url;
    }
    , sync: function(method, model, options){
      showlog('Folders:sync',arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });

      Backbone.sync(method, model, options);
    }
  });

})();

