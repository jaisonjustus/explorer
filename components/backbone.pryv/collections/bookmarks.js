define(['underscore', 'backbone', 'bookmark'], function(_, Backbone, Bookmark) {
  'use strict';

  return Backbone.Collection.extend({
    /* Variables. */
      model: Bookmark
    , sessionId: null
    , name: 'Bookmarks'
    /* Methods. */
    , initialize: function(models, options){
      this.sessionId = options.sessionId;
      this.baseApiUrl = options.baseApiUrl;
    } 
    , url: function(){
      return this.baseApiUrl+'/admin/bookmarks?auth='+encodeURIComponent(this.sessionId); 
    }
  });

});
