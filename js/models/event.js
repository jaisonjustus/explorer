(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Event = Backbone.Model.extend({
    defaults: {
        id: "5007a606e1689cc071000002" 
      , comment: "My event"
    }
    , initialize: function(){
      //showlog('Event:initialize');
    } 
  });

})();
