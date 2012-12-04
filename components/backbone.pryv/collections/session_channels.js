define(['jquery', 'underscore', 'backbone', 'channels'], function($, _, Backbone, Channels) {
  'use strict';

  return Channels.extend({
    url: function(){
      return this.baseApiUrl+'/admin/channels?auth='+encodeURIComponent(this.token);
    }
  });

});
