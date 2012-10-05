(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Folder = Backbone.Model.extend({
    defaults: {
      /* id, folderId */
      //   comment: null
      // , folderId: null
      // , value:null
    }
    , initialize: function(){
      var id = this.get('id');
      //showlog('Folder:initialize', id);
      this.folders = new window.app.Folders( this.attributes.children, {channelId:this.collection.channelId, parentId: id } );
    }
    , sync: function(method, model, options){
      showlog('Folder:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });

      /* HACK: should work without this.
       * children param should be accepted
       * url should be uniform for all API requests. */ 
      showlog("folder method:", method);
      if (method === 'update' || method === 'delete') {
        var url = window.app.baseApiUrl+'/'+this.collection.channelId+'/folders/'+model.get('id');
        $.ajax({url:url,data:{id:model.get('id'), folderId: this.folderId, name:model.get('name')}, type:(method==='update')?'PUT':'DELETE', success:function(res){
          options.success(res)
        }});
      } else {
        Backbone.sync(method, model, options);
      }
      //Backbone.sync(method, model, options);
    }
  });

})();
