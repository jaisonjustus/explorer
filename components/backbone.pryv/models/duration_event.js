define(['underscore', 'backbone', 'event'], function(_, Backbone, Event) {
  'use strict';

  return Event.extend({
    /* Variables. */
      name: 'DurationEvent'
    , duration: null
    /* Methods. */
    , url: function(){
      if (!this.get('id')){
        /* We only override the event creation. */
        return this.collection.baseApiUrl+'/'+this.collection.channelId+'/events/start?auth='+encodeURIComponent(this.collection.token);
      } else {
        return Event.prototype.url.call(this);
      }
    } 
  });

});
