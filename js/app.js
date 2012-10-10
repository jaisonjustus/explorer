(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  $(function(){
    /* Centralised ajax error handling. */
    $(document).ajaxError(function(e, xhr, settings, exception){
      showlog(xhr.status, xhr.responseText);
    });
  });

  /* Router. */
  window.app.App = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    }
    , initialize: function(){
      this.explorerView = new window.app.ExplorerView({});
    }
    , setFilter: function(param){
      //showlog('router:setFilter', param);
      param = param.trim() || '';
      switch(param){
        case 'admin': 
        case 'token':
          this.explorerView.setMode(param).render();
        break;
        default: { 
          new window.app.LandingView({}).render();
        }
      }
    }
  });

  /* Main entry point. */
  new window.app.App();
  /* Make correct root. */
  Backbone.history.start({root:'/'+window.location.pathname}); 

})();
