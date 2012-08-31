(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.EventEntryView = Backbone.View.extend({
    tagName: 'tr'
    , initialize: function(){
      //showlog('EventEntryView:initialize');
      this.template = _.template( $('#event_entry_template').html() );
    }
    , events: {
      
    }
    , render: function(){
      //showlog('EventEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
  });

  window.app.ChannelEntryView = Backbone.View.extend({
      tagName:'li'
    , initialize: function(){
      //showlog('ChannelEntryView:initialize');
      this.template = _.template( $('#channel_entry_template').html() );
    }
    , events: {
      'click .view'               : 'onClickView'
      //, 'click .edit' : 'onClickEdit'
    }
    , render: function(){
      //showlog('ChannelEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
    // , onClickEdit: function(){
    //   showlog('ChannelEntryView:onClickEdit');
    // }
    , onClickView: function(){
      var channelId = this.model.get('id');
      showlog('ChannelEntryView:onClickView',channelId);  
      this.model.events.reset();
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
      //showlog('ChannelView:initialize');
      this.template = _.template( $('#channel_view_template').html() ); 
      /* Events. */
      this.collection.on('reset', _.bind(function(){
        showlog('ChannelView::collection->reset');
        this.$channelList.empty();
      }, this));
      this.collection.on('add', _.bind(function(mod,col,idx){
        showlog('ChannelView::collection->add');
        this.$channelList.append( 
          new window.app.ChannelEntryView({model:mod}).render().$el
        );
        /* Events "events" */
        mod.events.on('reset',_.bind(function(mod){
          showlog('mod.events->reset'); 
          this.$eventList.empty();
        },this));
        mod.events.on('add',_.bind(function(mod){
          showlog('mod.events->add'); 
          this.$eventList.append(
            new window.app.EventEntryView({model:mod}).render().$el
          );
        },this));
      }, this));
    } 
    , events : {
        'click #signout_btn'            : 'onClickSignoutBtn' 
      , 'click #show_add_channel_modal_btn' : 'onClickShowAddChannelModalBtn'
      , 'click #show_add_event_modal_btn'   : 'onClickShowAddEventModalBtn' 
      , 'click #add_channel_btn' : 'onClickAddChannelBtn'
    }
    , render : function(){
      //showlog('ChannelView:render');
      this.$el.html( this.template() );
      /* Get tokens. */
      $.getJSON(window.app.baseUrl+'/admin/tokens')
        .success(_.bind(function(res){
          window.app.serverNow = res.serverNow;
          window.app.token = res.tokens[0].id;
          /* Get channels. */
          this.collection.reset().fetch({add:true});
        }, this))
      ;
      /* Shortcuts. */
      this.$channelList = this.$('#channel_list');
      this.$eventList = this.$('#event_list');
      this.$addChannelModal = this.$('#add_channel_modal');
      this.$newChannelInput = this.$('#add_channel_form #name');
      return this;
    }
    , onClickShowAddChannelModalBtn  : function(e){
      showlog('ChannelView:onClickShowAddChannelModalBtn');
      $('#add_channel_modal').modal();
      return false;
    }
    , onClickShowAddEventModalBtn  : function(e){
      showlog('ChannelView:onClickShowAddEventModalBtn');
      return false;
    }
    , onClickAddChannelBtn  : function(e){
      showlog('ChannelView:onClickAddChannelModalBtn');
      this.collection.addChannel(
        {name:this.$newChannelInput.val()}, 
        _.bind(function(){
          this.$addChannelModal.modal('hide') 
        },this)
      );
      return false;
    }
    , onClickSignoutBtn  : function(e){
      showlog('ChannelView:onClickSignoutBtn');
      return false;
    }
  });
})()
