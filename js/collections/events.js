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
    } 
    , url: function(){
      return window.app.baseApiUrl+'/'+this.channelId+'/events' 
    }
    , sync: function(method, model, options){
      showlog('Events:sync',arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });
      /* If we're not in a channel, specify which folder. */
      if (this.parentId !== this.channelId){
        if(method === "read"){
          var data = {onlyFolders:[this.parentId]};
          $.ajax({
            url:this.url(),
            data:data,
            success:function(res){
              options.success(res);
            }});
        } else {
          Backbone.sync(method, model, options);
        }
      } else {
        Backbone.sync(method, model, options);
      }
    }
  });

})();

