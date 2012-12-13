define(['underscore', 'backbone', 'event', 'duration_event', 'state'], function(_, Backbone, Event, DurationEvent, state) {
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
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          //xhr.setRequestHeader('Authorization', this.token);
        }, this)
      });
      var url = this.baseApiUrl+'/'+this.channelId+'/events/stop?auth='+this.token;

      var xhr = $.post(url, function(data, status, xhr){
        cb(data, status, xhr);
      });
    }
    , url: function(){
      var partialUrl = '';
      if(this.onlyFolders.length){
        for(var i = 0; i < this.onlyFolders.length; ++i){
          partialUrl += '&onlyFolders['+i+']='+this.onlyFolders[i];
        }
      }
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          //xhr.setRequestHeader('Authorization',this.token);
        }, this)
      });
      return this.baseApiUrl+'/'+this.channelId+'/events?state='+state.get('state')+'&auth='+this.token+partialUrl;
    }
  });

});