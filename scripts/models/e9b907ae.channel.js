define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    /* Variables. */
    /* Methods. */
    , initialize: function(){
      var id = this.get('id');
      //showlog('Channel:initialize',id);
    } 
  });

});
