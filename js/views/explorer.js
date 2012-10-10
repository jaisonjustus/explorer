(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.ExplorerView = Backbone.View.extend({
    /* Variables */
      el: '#view_entry'
    , template: '#explorer_view' 
    , mode: 'admin'
    , views: null
    , name: 'ExplorerView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
      this.views = {
          admin: new window.app.AdminView({})
        , token: new window.app.TokenView({})
      };
      this.views.admin.on('signOut',_.bind(this.onClickSignOutBtn,this));
      this.views.token.on('signOut',_.bind(this.onClickSignOutBtn,this));
    }
    , events: {
        'click #signout_btn' : 'onClickSignOutBtn' 
    }
    , render: function(){
      showlog(this.name+':render',this.mode);
      /* Render frame view and activate correct tab. */
      this.$el.html(this.template());
      this.$('#menu li').removeClass('active');
      this.$('#menu li.'+this.mode).addClass('active');
      /* Render sub-view. */
      this.views[this.mode].render();
      return this; 
    }
    , setMode: function(mode){
      this.mode = mode;
      return this;
    }
    , onClickSignOutBtn  : function(e){
      showlog(this.name+':onClickSignoutBtn');
      store.clear();
      window.location.href = window.location.pathname; 
      return false;
    }
  });  

})()
