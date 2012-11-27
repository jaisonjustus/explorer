define(['jquery', 'underscore', 'backbone', 'channels', 'state'], function($, _, Backbone, Channels, state) {
  'use strict';

  return Channels.extend({
    url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          //xhr.setRequestHeader('Authorization', this.token);
        }, this)
      });
      return this.baseApiUrl+'/channels?state='+state.get('state')+'&auth='+this.token;
    }
  });

});
