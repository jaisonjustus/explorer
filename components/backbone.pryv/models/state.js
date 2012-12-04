define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var state = new (Backbone.Model.extend({
    defaults: {      
      state : 'default'
    }
  }))();

  return state;

});
