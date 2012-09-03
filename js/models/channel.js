(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
        id: "5007a606e1689cc071000002" 
      , name: "Main Channel"
    }
    , initialize: function(){
      //showlog('Channel:initialize');
      /* Create event collection. */
      this.events = new window.app.Events({});
    } 
    , sync: function(method, model, options){
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
  });

})();
