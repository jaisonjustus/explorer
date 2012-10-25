(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Accesses = Backbone.Collection.extend({
    /* Variables. */
      model: window.app.Access
    , sessionId: null
    , baseApiUrl: null
    , name: 'Accesses'
    /* Methods. */
    , initialize: function(models, options){
      this.sessionId = options.sessionId || null;
      this.baseApiUrl = options.baseApiUrl || null;
    } 
    , url: function(){
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', this.sessionId);
        }, this)
      });
      return this.baseApiUrl+'/admin/accesses'; 
    }
  });

})();

