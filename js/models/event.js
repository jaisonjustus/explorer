(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
      /* id, contextId */
      comment: null
    }
    , initialize: function(){
      //showlog('Event:initialize');
    } 
    , sync: function(method, model, options){
      var channelId = window.app.currentChannel.get('id');
      showlog('Event:sync',channelId,'method',method,'model',model,'options',options);
      if (method === 'create'){
        $.ajaxSetup({
          'beforeSend': function(xhr){
            xhr.setRequestHeader("Authorization", window.app.token);
          }
        });
        var xhr = $.post(window.app.baseApiUrl+'/'+channelId+'/events', model.toJSON(), 'json')
          .success(_.bind(function(res){
            showlog('event',res,typeof(res));
            options.success(res);
          }, this))
        ;
      } else if (method === 'delete'){
        var eventId = model.get('id')
          , url = window.app.baseApiUrl+'/'+channelId+'/events/'+eventId;
          ;
        showlog('eventId',eventId);
        $.ajax({
          url: url,
          type: 'DELETE',
          success: function(res){ options.success(res); }
        });
      } else {
        Backbone.sync(method, model, options);
      }
    }
  });

})();
