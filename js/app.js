(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  $(function(){
    /* Centralised ajax error handling. */
    $(document).ajaxError(function(e, xhr, settings, exception){
      showlog('Ajax error',e,'xhr',xhr,'settings',settings,'exception',exception);
    });
  });

  /* Router. */
  window.app.App = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    }
    , initialize: function(){
      //showlog('router:initialize');
      /* Init collections. */
      this.channels = new window.app.Channels();
      /* Init views. */
      this.landingView  = new window.app.LandingView({});
      this.channelView = new window.app.ChannelView({
        collection: this.channels
      });
    }
    , setFilter: function(param){
      //showlog('router:setFilter', param);
      param = param.trim() || '';
      switch(param){
        case 'channels': {
          //showlog('router:channels');
          this.channelView.render();
        } break;
        default: { 
          //showlog('router:landing');
          this.landingView.render();
        }
      }
    }
  });

  /* Main entry point. */
  new window.app.App();
  Backbone.history.start({root:'/'}); 

})();
