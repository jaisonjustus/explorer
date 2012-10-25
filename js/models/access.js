(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.Access = Backbone.Model.extend({
    /* Variables */
      name: 'Access'
    , token: null
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
