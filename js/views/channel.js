(function(){
  /* Namespace. */
  window.app = window.app || {};

  window.app.ChannelView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      showlog('ChannelView:initialize');
      this.template = _.template( $('#channel_view_template').html() );
    } 
    , events : {
        'click #signout_btn' : 'onClickSignoutBtn' 
      , 'click #add_channel_btn' : 'onClickAddChannelBtn' 
      , 'click #add_event_btn' : 'onClickAddEventBtn' 
    }
    , render : function(){
      showlog('ChannelView:render');
      this.$el.html( this.template() );
      return this;
    }
    , onClickAddChannelBtn  : function(e){
      showlog('ChannelView:onClickAddChannelBtn');
      return false;
    }
    , onClickAddEventBtn  : function(e){
      showlog('ChannelView:onClickAddEventBtn');
      return false;
    }
    , onClickSignoutBtn  : function(e){
      showlog('ChannelView:onClickSignoutBtn');
      return false;
    }
  });
})()
