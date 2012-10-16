(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Tokens = Backbone.Collection.extend({
    /* Variables. */
      model: window.app.Token
    , sessionId: null
    , baseApiUrl: null
    , name: 'Tokens'
    /* Methods. */
    , initialize: function(models, options){
      this.sessionId = options.sessionId || null;
      this.baseApiUrl = options.baseApiUrl || null;
    } 
    , url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.sessionId);
        }, this)
      });
      return this.baseApiUrl+'/admin/tokens'; 
    }
    , parse: function(res){
      showlog(this.name+':parse',res);
      return res.tokens;
    }
    // , sync: function(method, model, options){
    //   $.ajax({
    //       url:this.url()
    //     , success:_.bind(function(res){
    //         showlog("res:",this.url(),res);
    //       }, this)
    //   });
    // }
  });

})();

