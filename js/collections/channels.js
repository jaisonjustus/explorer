(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};


  var Channels = Backbone.Collection.extend({
    /* Variables. */
      model: window.app.Channel
    , token: null
    , baseApiUrl: null
    /* Methods. */
    , initialize: function(models, options){
      //showlog('SessionChannels:initialize');
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
    } 
  });

  window.app.SessionChannels = Channels.extend({
    url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.token);
        }, this)
      });
      return this.baseApiUrl+'/admin/channels';
    }
  });

  window.app.TokenChannels = Channels.extend({
    url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.token);
        }, this)
      });
      return this.baseApiUrl+'/channels';
    }
  });

})();
