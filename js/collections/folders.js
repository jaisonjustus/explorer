(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Folders = Backbone.Collection.extend({
      model: window.app.Folder
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
      var url = this.baseApiUrl+'/'+this.channelId+'/folders';
      if (this.parentId !== this.channelId){
        url += '/'+this.parentId;
      }
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      return url;
    }
    , sync: function(method, model, options){
      showlog('Folders:sync',arguments);
      /* HACK: can be removed once the URL is uniform for all API calls. */
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      var url = this.baseApiUrl+'/'+this.channelId+'/folders';
      if (method === 'read' || method === 'create'){
        if (this.parentId !== this.channelId){
          url += '/'+this.parentId;
        }
      }
      $.ajax({url:url,success:function(res){
        options.success(res);
      }});

      //Backbone.sync(method, model, options);
    }
  });

})();

