define(['jquery', 'underscore', 'backbone', 'channels'], function($, _, Backbone, Channels) {
  'use strict';

  return Channels.extend({
    url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.token);
        }, this)
      });
      return this.baseApiUrl+'/admin/channels';
    }
  });

});
