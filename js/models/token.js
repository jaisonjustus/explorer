(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Token = Backbone.Model.extend({
    /* Variables */
      name: 'Token'
    , active: false
    , defaults: {
        name : null
      , type : null
    }
    /* Methods */
    , initialize: function(){
    }
    , baseApiUrl: function(username){
      return 'https://'+username+'.rec.la';
    }
  });

})();
