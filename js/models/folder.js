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
      //showlog('Folder:initialize');
    } 
    , sync: function(method, model, options){
      showlog('Folder:sync', arguments);
      $.ajaxSetup({
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization',window.app.token);
        }
      });

      /* Need to fix this. Should work without this. (children param should not been sent). */ 
      if (method === "update") {
        $.ajax({url:this.url(),data:{id:model.get('id'),name:model.get('name')},type:'PUT',success:function(res){
          options.success(res)
        }});
      } else {
        Backbone.sync(method, model, options);
      }
      //Backbone.sync(method, model, options);
    }
  });

})();
