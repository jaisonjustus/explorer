define(['underscore', 'backbone', 'event', 'duration_event', 'state', 'pryv'], function(_, Backbone, Event, DurationEvent, state, PrYv) {
  'use strict';

  return Backbone.Collection.extend({
      name: 'Events'
    , folderId: null 
    , channelId: '-1'
    , token: null
    , baseApiUrl: null
    /* Methods. */
    , model: function(attrs, options){
      if(attrs.duration === undefined ){
        /* Events with an undefined duration are Mark events. */
        return new Event(attrs, options);
      }
      else {
        /* Events with a defined duration (can be null) are Duration events. */
        return new DurationEvent(attrs, options);
      }
    }
    , initialize: function(models, options){
      this.folderId = options.folderId;
      this.channelId = options.channelId;
      this.token = options.token;
      this.baseApiUrl = options.baseApiUrl;
      this.onlyFolders = options.onlyFolders || [];
    } 
    , stopCurrentEvent: function(cb){
      var url = this.baseApiUrl+'/'+this.channelId+'/events/stop?auth='+encodeURIComponent(this.token);
      PrYv.post({
          url:url
        , success:function(res){ cb(res) }
      });
    }
    , url: function(){
      var partialUrl = '';
      if(this.onlyFolders.length){
        for(var i = 0; i < this.onlyFolders.length; ++i){
          partialUrl += '&onlyFolders['+i+']='+this.onlyFolders[i];
        }
      }
      return this.baseApiUrl+'/'+this.channelId+'/events?state='+state.get('state')+'&auth='+encodeURIComponent(this.token)+partialUrl;
    }
  });

});
