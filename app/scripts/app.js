define(['backbone', 'explorer', 'landing', 'settings'], function(Backbone, ExplorerView, LandingView, Settings) {
  'use strict';

  return Backbone.Router.extend({
    routes: {
      '*filter' : 'setFilter'
    }
    , initialize: function(){
      this.settings = new Settings();
      this.explorerView = new ExplorerView({model: this.settings});
    }
    , setFilter: function(param){
      param = param.trim() || '';
      switch(param){
        case 'admin':
        case 'token': 
          this.explorerView.setMode(param).render();
          break;
        default: { 
          new LandingView({model: this.settings}).render();
        }
      }
    }
  });
});
