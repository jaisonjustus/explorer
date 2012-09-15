(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
      model: window.app.Event
    , parentId: '-1'
    , initialize: function(models, options){
      //showlog('Events:initialize',this,options);
      this.parentId = options.parentId;
    } 
    , url: function(){
      return window.app.baseApiUrl+'/'+this.parentId+'/events' 
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

