(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channels = Backbone.Collection.extend({
    model: window.app.Channel
    , initialize: function(){
      //showlog('Channels:initialize');
    } 
    , url: function(){
      return window.app.baseApiUrl+'/admin/channels';
    }
    , parse: function(res){
      showlog('Channels:parse',res);
      window.app.serverNow = res.serverNow;
      return res.channels;
    }
    , addChannel: function(data, cb){
      var url = window.app.baseApiUrl+'/admin/channels'
      $.ajaxSetup({
        'beforeSend': function(){}
      });
      var xhr = $.post(url, data, 'json')
        .success(_.bind(function(res){
          /* Reload channel list. */
          this.fetch();
          cb();
        }, this));  
    }
    , removeChannel: function(data, cb){
      var url = window.app.baseApiUrl+'/admin/channels'
      $.ajaxSetup({
        'beforeSend': function(){}
      });
      var xhr = $.del(url, data, 'json')
        .success(_.bind(function(res){
          /* Reload channel list. */
          this.fetch();
          cb();
        }, this));  
    }
  });

})();
