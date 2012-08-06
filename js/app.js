(function(){

  /* Namespace. */
  window.app = window.app || {};

  $(function(){
    /* Centralised ajax error handling. */
    $(document).ajaxError(function(e, xhr, settings, exception){
      showlog('Ajax error',e,'xhr',xhr,'settings',settings,'exception',exception);
    });
  });

  /* Router. */
  window.App = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    }
    , initialize: function(){
      showlog('router:initialize');
      /* Init views. */
      this.landingView  = new window.app.LandingView({});
      this.channelView = new window.app.ChannelView({});
    }
    , setFilter: function(param){
      showlog('router:setFilter', param);
      param = param.trim() || '';
      switch(param){
        case 'channels': {
          showlog('router:channels');
          this.channelView.render();
        } break;
        default: { 
          showlog('router:landing');
          this.landingView.render();
        }
      }
    }
  });

  /* Main entry point. */
  window.app = new App();
  Backbone.history.start({root:'/'}); 

})();
