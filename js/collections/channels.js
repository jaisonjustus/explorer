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
      return window.app.baseUrl+'/admin/channels';
    }
    , parse: function(res){
      //showlog('Channels:parse',res);
      window.app.serverNow = res.serverNow;
      _.each(res.channels, function(c){
        this.add( new window.app.Channel(c) );
      }, this);
    }
    , addChannel: function(data, cb){
      var url = window.app.baseUrl+'/admin/channels'
      $.ajaxSetup({
        'beforeSend': function(){}
      });
      var xhr = $.post(url, data, 'json')
        .success(_.bind(function(res){
          /* Reload channel list. */
          this.reset().fetch({add:true});
          cb();
        }, this));  
    }
    , removeChannel: function(data, cb){
      var url = window.app.baseUrl+'/admin/channels'
      $.ajaxSetup({
        'beforeSend': function(){}
      });
      var xhr = $.del(url, data, 'json')
        .success(_.bind(function(res){
          /* Reload channel list. */
          this.reset().fetch({add:true});
          cb();
        }, this));  
    }
  });

})();
