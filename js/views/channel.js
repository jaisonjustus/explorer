(function(){
  /* Namespace. */
  window.app = window.app || {};

  window.app.EventEntryView = Backbone.View.extend({
    el: '#event_list'
    , tagName: 'tr'
    , initialize: function(){
      showlog('EventEntryView:initialize');
      this.template = _.template( $('#event_entry_template').html() );
    }
    , events: {
      
    }
    , render: function(){
      showlog('EventEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
  });

  window.app.ChannelEntryView = Backbone.View.extend({
    el: '#channel_list'
    , tagName:'li'
    , initialize: function(){
      showlog('ChannelEntryView:initialize');
      this.template = _.template( $('#channel_entry_template').html() );
    }
    , events: {
      'click .view' : 'onClickView'
      //, 'click .edit' : 'onClickEdit'
    }
    , render: function(){
      showlog('ChannelEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
    // , onClickEdit: function(){
    //   showlog('ChannelEntryView:onClickEdit');
    // }
    , onClickView: function(){
      showlog('ChannelEntryView:onClickView');  
      var channelId = this.model.get('id');
      $.ajaxSetup({
        'beforeSend': function(xhr){
          xhr.setRequestHeader("Authorization", window.app.token);
        }
      });
      $.getJSON(window.app.baseUrl+'/'+channelId+'/events')
        .success(_.bind(function(res){
          showlog('events',res);
          window.app.serverNow = res.serverNow;
          _.each(res.events, function(e){
            this.model.events.add( new window.app.Event(e) );
          }, this);
        }, this))
      ;
      return false;
    }
  });

  window.app.ChannelView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      showlog('ChannelView:initialize',this);
      this.template = _.template( $('#channel_view_template').html() ); 
      this.collection.on('add', _.bind(function(mod,col,idx){
        showlog('collection->add');
        new window.app.ChannelEntryView({model:mod}).render()
        mod.events.on('add',_.bind(function(mod){
          showlog('mod.events->add'); 
          new window.app.EventEntryView({model:mod}).render()
        },this));
      }, this));
    } 
    , events : {
        'click #signout_btn' : 'onClickSignoutBtn' 
      , 'click #add_channel_btn' : 'onClickAddChannelBtn' 
      , 'click #add_event_btn' : 'onClickAddEventBtn' 
    }
    , render : function(){
      showlog('ChannelView:render');
      this.$el.html( this.template() );
      /* Get tokens. */
      $.getJSON(window.app.baseUrl+'/admin/tokens')
        .success(_.bind(function(res){
          showlog('tokens',res);
          window.app.serverNow = res.serverNow;
          window.app.token = res.tokens[0].id;
        }, this))
      ;
      /* Get channels. */
      $.getJSON(window.app.baseUrl+'/admin/channels')
        .success(_.bind(function(res){
          showlog('channels',res);
          window.app.serverNow = res.serverNow;
          _.each(res.channels, function(c){
            this.collection.add( new window.app.Channel(c) );
          }, this);
        }, this))
      ;
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
