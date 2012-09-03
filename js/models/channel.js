(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
        id: "5007a606e1689cc071000002" 
      , name: "Main Channel"
    }
    , initialize: function(){
      //showlog('Channel:initialize');
      /* Create event collection. */
      this.events = new window.app.Events({});
    } 
    , sync: function(method, model, options){
      showlog('Channel:sync',arguments);
      if (method === 'delete'){
        var id = model.get('id');
        var url = window.app.baseUrl+'/admin/channels/'+id+'?deleteChannelData=true';
        $.ajax({
          url: url,
          type: 'DELETE',
          success: _.bind(function(res){
            console.log('Success deleting channel',id);
            options.success(res);
          }, this)
        });
      } else {
        Backbone.sync(method, model, options);
      }
    }
    , addEvent: function(data, cb){
      var id = this.get('id');
      var url = window.app.baseUrl+'/'+id+'/events';
      var e = new window.app.Event(data);
      $.ajaxSetup({
        'beforeSend': function(xhr){
          xhr.setRequestHeader("Authorization", window.app.token);
        }
      });
      var xhr = $.post(window.app.baseUrl+'/'+id+'/events', data, 'json')
        .success(_.bind(function(res){
          showlog('event',res,typeof(res));
          window.app.serverNow = res.serverNow;
          e.set('id',res.id);
          this.events.add( e );
          cb();
        }, this))
      ;
    }
  });

})();
