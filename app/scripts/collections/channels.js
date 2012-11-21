define(['jquery', 'underscore', 'backbone', 'channel'], function($, _, Backbone, Channel) {
  'use strict';

  return Backbone.Collection.extend({
    /* Variables. */
      model: Channel
    , token: null
    , baseApiUrl: null
    /* Methods. */
    , initialize: function(models, options){
      //showlog('SessionChannels:initialize');
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
    } 
  });

});
