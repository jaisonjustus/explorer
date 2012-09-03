(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.State = Backbone.Model.extend({
    defaults: {
        current_channel: null 
    }
    , initialize: function(){
      //showlog('State:initialize');
    } 
  });

})();
