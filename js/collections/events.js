(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
      model: window.app.Event
    , contextId: '-1'
    , initialize: function(models, options){
      //showlog('Events:initialize',this,options);
      this.contextId = options.contextId;
    } 
    , url: function(){
      return window.app.baseApiUrl+'/'+this.contextId+'/events' 
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

