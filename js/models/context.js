(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Context = Backbone.Model.extend({
    defaults: {
        username  : null
      , token     : null
    , initialize: function(){
      showlog('Context:initialize');
    }
    , baseApiUrl: function(){
      return 'https://'+this.get('username')+'.rec.la';
      //return 'http://localhost:3080/'+this.get('username');
    }
  });

})();
