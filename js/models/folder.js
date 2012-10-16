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
      //showlog('Folder:initialize',id,this.attributes);
      this.folders = new window.app.Folders( this.attributes.children, {
          channelId:this.collection.channelId
        , parentId: id 
        , token: this.collection.token
        , baseApiUrl: this.collection.baseApiUrl
      });
    }
  });

})();
