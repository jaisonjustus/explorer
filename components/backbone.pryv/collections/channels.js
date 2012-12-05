define(['jquery', 'underscore', 'backbone', 'channel', 'state'], function($, _, Backbone, Channel, state) {
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
    , url: function(){
      return this.baseApiUrl+'/channels?state='+state.get('state')+'&auth='+encodeURIComponent(this.token);
    }
  });

});
