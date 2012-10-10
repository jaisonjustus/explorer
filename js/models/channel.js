(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channel = Backbone.Model.extend({
    defaults: {
      /* id, name */ 
    }
    /* Variables. */
    /* Methods. */
    , initialize: function(){
      var id = this.get('id');
      //showlog('Channel:initialize',id);
    } 
  });

})();
