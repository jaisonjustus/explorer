(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
      model: window.app.Event
    , contextId: '-1'
    , initialize: function(models, options){
      //showlog('Events:initialize',this,options);
      this.contextId = options.contextId;
    } 
    , url: function(){
      return window.app.baseApiUrl+'/'+this.contextId+'/events' 
    }
    , parse: function(res){
      showlog('Events:parse',res,'# events',res.events.length);  
      window.app.serverNow = res.serverNow;
      return res.events;
    } 
    , sync: function(method, model, options){
      showlog('Events:sync',arguments);
      if (method === 'read') {
        $.ajaxSetup({
          'beforeSend': function(xhr){
            xhr.setRequestHeader("Authorization", window.app.token);
          'token'}
        });
        $.getJSON(window.app.baseApiUrl+'/'+this.contextId+'/events')
          .success(function(res){
            showlog('events',res);
            options.success(res);
          })
        ;
      } else {
        Backbone.sync(method, model, options);
      }
    }
  });

})();

