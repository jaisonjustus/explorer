define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {
      /* id, folderId */
      //   comment: null
      // , folderId: null
      // , value:null
    }
    , initialize: function(){
      var id = this.get('id');
    }
  });

});
