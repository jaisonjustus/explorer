(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.ChannelEntryView = Backbone.View.extend({
      tagName:'li'
    , initialize: function(){
      //showlog('ChannelEntryView:initialize');
      this.template = _.template( $('#channel_entry_template').html() );

      var events = this.model.events
        , $eventList = $('#event_list')
        ; 
      this.model.on('destroy', function(){
        $eventList.empty();
      });
      events.on('destroy', function(/*mod,col,opts*/){
        showlog('channel.events->destroy');
        events.fetch();
      });
      events.on('reset', function(){
        showlog('channel.events->reset'); 
        $eventList.empty();
        events.each(function(e){
          $eventList.append(
            new window.app.EventEntryView({model:e}).render().$el
          );
        });
      });
    }
    , events: {
        'click .channel'  : 'onClick'
      , 'click .delete'   : 'onClickDelete'
    }
    , render: function(){
      //showlog('ChannelEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      this.$el.find('.channel').toggleClass('pull-right', window.app.channelEditMode);
      this.$el.find('.delete').toggle( window.app.channelEditMode );
      return this;
    }
    , onClick: function(){
      var channelId = this.model.get('id');
      showlog('ChannelEntryView:onClick',channelId);  
      /* Add selected class. */
      $('#channel_list a').removeClass('selected');
      this.$('a').addClass('selected');
      /* Store current focused channel. */
      window.app.currentChannel = this.model;
      /* Empty events. */
      this.model.events.fetch();
      return false;
    }
    , onClickDelete: function(){
      showlog('ChannelEntryView:onClickDelete', this.model.get('id'));
      this.model.destroy({wait:true});
      return false;
    }
  });

  window.app.EventEntryView = Backbone.View.extend({
    tagName: 'tr'
    , initialize: function(){
      //showlog('EventEntryView:initialize');
      this.template = _.template( $('#event_entry_template').html() );
    }
    , events: {
      'click .delete'   : 'onClickDelete'
    }
    , render: function(){
      //showlog('EventEntryView:render');
      this.$el.append(
        /* When event is at the root, contextId is not defined. Bummer! */
        this.template( _.extend( {contextId:null}, this.model.toJSON() ) ) 
      );
      return this;
    }
    , onClickDelete: function(){
      var eventId = this.model.get('id');
      showlog('EventEntryView:onClickDelete', eventId);
      this.model.destroy({wait:true});
    }
  });

  window.app.ExplorerView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      //showlog('ExplorerView:initialize');
      window.app.channelEditMode = window.app.eventEditMode = false;
      this.template = _.template( $('#explorer_view_template').html() ); 
      /* Events. */
      this.collection.on('reset', _.bind(function(col,opts){
        showlog('ExplorerView::channels->reset',col,this.collection);
        this.$channelList.empty();
        /* Dont show edit toggle if no channel. */
        if (this.collection.length){
          this.$toggleEditChannels.show();
        } else {
          this.$toggleEditChannels.hide();
          if (window.app.channelEditMode){
            this.onClickToggleEditChannels(null, false);
          }
        }
        col.each(function(channel){
          /* Dont show edit toggle if no events. */
          channel.events.on('reset', function(){
            if (channel.events.length){
              this.$toggleEditEvents.show();
            } else {
              this.$toggleEditEvents.hide();
              if (window.app.eventEditMode){
                this.onClickToggleEditEvents(null, false);
              }
            }
          }, this);
          this.$channelList.append(
            new window.app.ChannelEntryView({
                model: channel
            }).render().$el
          );
        }, this);
      }, this));
      this.collection.on('destroy', function(mod,col,opts){
        showlog('ExplorerView::channels->destroy');  
        col.fetch();
      });
      this.collection.on('add', function(channel,col,opts){
        showlog('ExplorerView::channels->add');
      });
    } 
    , events : {
        'click #signout_btn'                : 'onClickSignoutBtn' 
      , 'click #show_add_channel_modal_btn' : 'onClickShowAddChannelModalBtn'
      , 'click #show_add_event_modal_btn'   : 'onClickShowAddEventModalBtn' 
      , 'click #toggle_edit_channels_btn'   : 'onClickToggleEditChannels'
      , 'click #toggle_edit_events_btn'     : 'onClickToggleEditEvents'
      , 'click #save_channel_btn'           : 'onClickSaveChannelBtn'
      , 'click #save_event_btn'             : 'onClickSaveEventBtn'
    }
    , render : function(){
      this.$el.html( this.template() );
      showlog('ExplorerView:render');
      /* Check if token is in local storage. */
      window.app.token = store.get('token');
      if (!window.app.token){
        /* Get tokens. */
        var url = window.app.baseApiUrl+'/admin/tokens';
        $.getJSON(url)
          .success(_.bind(function(res){
            window.app.serverNow = res.serverNow;
            window.app.token = res.tokens[0].id;
            /* Init local storage with latest app data. */
            store.clear();
            store.set('token', window.app.token);
            store.set('username', window.app.username);
            store.set('baseApiUrl', window.app.baseApiUrl);
            /* Get channels. */
            showlog('token',window.app.token,'now fetching channels');
            this.collection.fetch();
          }, this))
        ;
      } else {
        /* Init app with local storage data. */
        window.app.token = store.get('token');
        window.app.username = store.get('username');
        window.app.baseApiUrl = store.get('baseApiUrl');
        /* Get channels. */
        showlog('token',window.app.token,'now fetching channels');
        this.collection.fetch();
      }
      /* Shortcuts. */
      this.$channelList         = this.$('#channel_list');
      this.$eventList           = this.$('#event_list');
      this.$toggleEditChannels  = this.$('#toggle_edit_channels_btn');
      this.$toggleEditEvents    = this.$('#toggle_edit_events_btn');
      this.$addChannelModal     = this.$('#add_channel_modal');
      this.$addEventModal       = this.$('#add_event_modal');
      this.$newChannelInput     = this.$('#add_channel_form #name');
      this.$newEventInput       = this.$('#add_event_form #comment');

      return this;
    }
    , onClickShowAddChannelModalBtn  : function(e){
      showlog('ExplorerView:onClickShowAddChannelModalBtn');
      this.onClickToggleEditChannels(null, false);
      this.onClickToggleEditEvents(null, false);
      this.$addChannelModal.modal();
      return false;
    }
    , onClickShowAddEventModalBtn  : function(e){
      showlog('ExplorerView:onClickShowAddEventModalBtn');
      this.onClickToggleEditEvents(null, false);
      this.onClickToggleEditChannels(null, false);
      this.$addEventModal.modal();
      return false;
    }
    , onClickToggleEditChannels: function(e, flag){
      /* Toggle edit mode. */
      window.app.channelEditMode = (flag !== undefined) ? flag :
        !window.app.channelEditMode;
      flag = window.app.channelEditMode;
      showlog('ExplorerView:onClickToggleEditChannels', e, flag);
      /* Simulated click? */
      if (e) this.onClickToggleEditEvents(null, false);
      this.$toggleEditChannels.toggleClass('btn-primary', flag);
      this.$toggleEditChannels.find('i')
        .toggleClass('icon-edit', !flag)
        .toggleClass('icon-ok', flag);
      this.$('.channel').toggleClass('pull-right', flag);
      this.$('#channel_list .delete').toggle(flag);
      return false;
    }
    , onClickToggleEditEvents: function(e, flag){
      /* Toggle edit mode. */
      window.app.eventEditMode = (flag !== undefined) ? flag :
        !window.app.eventEditMode;
      flag = window.app.eventEditMode;
      showlog('ExplorerView:onClickToggleEditEvents', e, flag);
      /* Simulated click? */
      if (e) this.onClickToggleEditChannels(null, false);
      this.$toggleEditEvents.toggleClass('btn-primary', flag);
      this.$toggleEditEvents.find('i')
        .toggleClass('icon-edit', !flag)
        .toggleClass('icon-ok', flag);
      this.$('.event').toggleClass('pull-right', flag);
      this.$('#event_list .delete').toggle(flag);
      return false;
    }
    , onClickSaveChannelBtn  : function(e){
      showlog('ExplorerView:onClickSaveChannelBtn');
      this.collection.addChannel(
        {name:this.$newChannelInput.val()}, 
        _.bind(function(){
          this.$newChannelInput.val('');
          this.$addChannelModal.modal('hide') 
        },this)
      );
      return false;
    }
    , onClickSaveEventBtn  : function(e){
      showlog('ExplorerView:onClickSaveEventBtn');
      window.app.currentChannel.events.create(
        {
            comment:this.$newEventInput.val()
        }, 
        {
          success:_.bind(function(event){
            showlog('success creating new event',arguments);
            this.$newEventInput.val('');
            this.$addEventModal.modal('hide');
            window.app.currentChannel.events.fetch();
          }, this)
        }
      );
      return false;
    }
    , onClickSignoutBtn  : function(e){
      showlog('ExplorerView:onClickSignoutBtn');
      store.clear();
      window.location.href = e.target.href; 
      return false;
    }
  });
})()
