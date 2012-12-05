define(['underscore', 'backbone', 'store', 'token', 'state'], function(_, Backbone, Store, TokenView, state) {
  'use strict';

  return Backbone.View.extend({
    /* Variables */
      el: '#view_entry'
    , template: '#explorer_view' 
    , mode: 'token'
    , views: null
    , name: 'ExplorerView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
      this.views = {
        token: new TokenView({model: this.model})
      };
      this.views.token.on('signOut',_.bind(this.onClickSignOutBtn,this));
    }
    , events: {
        'change #view_select' : 'onChangeViewSelect'
      , 'click #signout_btn'  : 'onClickSignOutBtn' 
    }
    , render: function(){
      console.log(this.name+':render',this.mode);
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
    , onChangeViewSelect: function(){
      console.log(this.name+':onChangeViewSelect', this.$('#view_select').val());
      state.set('state',this.$('#view_select').val());
    }
    , onClickSignOutBtn: function(e){
      console.log(this.name+':onClickSignoutBtn');
      Store.clear();
      window.location.href = window.location.pathname; 
      return false;
    }
  });  

});
