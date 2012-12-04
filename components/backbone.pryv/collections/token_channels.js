define(['jquery', 'underscore', 'backbone', 'channels', 'state'], function($, _, Backbone, Channels, state) {
  'use strict';

  return Channels.extend({
    url: function(){
      return this.baseApiUrl+'/channels?state='+state.get('state')+'&auth='+encodeURIComponent(this.token);
    }
  });

});
