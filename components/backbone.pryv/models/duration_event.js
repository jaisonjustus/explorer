define(['underscore', 'backbone', 'event'], function(_, Backbone, Event) {
  'use strict';

  return Event.extend({
    /* Variables. */
      name: 'DurationEvent'
    , duration: null
    /* Methods. */
    , url: function(){
      /* We only override the event creation
       * if no duration is provided ==> start! */
      if (!this.get('id') && this.get('duration') === null){
        return this.collection.baseApiUrl+'/'+this.collection.channelId+'/events/start?auth='+encodeURIComponent(this.collection.token);
      } else {
        return Event.prototype.url.call(this);
      }
    } 
  });

});
