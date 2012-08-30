(function(){
  /* Namespace. */
  window.app = window.app || {};

  window.app.Channels = Backbone.Collection.extend({
    model: window.app.Channel
    , initialize: function(){
      showlog('Channels:initialize');
    } 
  });

})();
