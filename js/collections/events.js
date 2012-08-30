(function(){
  /* Namespace. */
  window.app = window.app || {};

  window.app.Events = Backbone.Collection.extend({
    model: window.app.Event
    , initialize: function(){
      showlog('Events:initialize');
    } 
  });

})();
