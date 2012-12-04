define(['underscore', 'backbone', 'access'], function(_, Backbone, Access) {
  'use strict';

  return Backbone.Collection.extend({
    /* Variables. */
      model: Access
    , sessionId: null
    , baseApiUrl: null
    , name: 'Accesses'
    /* Methods. */
    , initialize: function(models, options){
      this.sessionId = options.sessionId || null;
      this.baseApiUrl = options.baseApiUrl || null;
    } 
    , url: function(){
      return this.baseApiUrl+'/admin/accesses?auth='+encodeURIComponent(this.sessionId); 
    }
  });

});
