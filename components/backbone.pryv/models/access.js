define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    /* Variables */
      name: 'Access'
    , token: null
    , active: false
    , defaults: {
        name : null
      , type : null
    }
    /* Methods */
    , initialize: function(){
    }
    , baseApiUrl: function(username){
      return 'https://'+username+'.rec.la';
    }
  });

});
