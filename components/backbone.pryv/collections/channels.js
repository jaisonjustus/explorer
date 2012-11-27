define(['jquery', 'underscore', 'backbone', 'channel'], function($, _, Backbone, Channel) {
  'use strict';

  return Backbone.Collection.extend({
    /* Variables. */
      model: Channel
    , token: null
    , baseApiUrl: null
    /* Methods. */
    , initialize: function(models, options){
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
    } 
  });

});
