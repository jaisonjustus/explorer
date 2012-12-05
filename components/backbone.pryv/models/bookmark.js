define(['backbone'], function(Backbone) {
  'use strict';

  return Backbone.Model.extend({
    /* Variables */
      id: null
    , name: null 
    , username: null
    , accessToken: null
    , active: false
    , socketio: null
    /* Methods */
    , initialize: function(attributes){
      this.username = attributes.username;
    }
    , baseApiUrl: function(){
      return 'https://'+this.username+'.rec.la';
    }
  });

});
