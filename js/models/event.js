(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
      /* id, folderId */
        comment: null
      , folderId: ''
      , value:null
    }
    , initialize: function(){
      //showlog('Event:initialize', this);
    } 
    , url: function(){
      var url = window.app.baseApiUrl+'/'+this.collection.channelId+'/events';
      var id = this.get('id');
      if (id){
        url += '/'+id;
      }
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.collection.token);
        }, this)
      });
      return url;
    }
    , sync: function(method, model, options){
      showlog('Event:sync', arguments);
      /* HACK: can be removed once the "modified" param is accepted by backend. */
      if (method === 'update'){
        showlog("this",model);
         $.ajax({url:this.url(),data:{id:model.get('id'), folderId: model.get('folderId'), comment:model.get('comment'), time:model.get('time')},type:'PUT',success:function(res){
           options.success(res)
         }});
      } else {
        Backbone.sync(method, model, options);
      }
    }
  });

})();
