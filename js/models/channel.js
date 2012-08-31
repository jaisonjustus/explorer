(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
        id: "5007a606e1689cc071000002" 
      , name: "Main Channel"
    }
    , initialize: function(){
      //showlog('Channel:initialize');
      /* Create event collection. */
      this.events = new window.app.Events({});
    } 
  });

})();
