(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.ChannelEntryView = Backbone.View.extend({
      tagName:'li'
    , initialize: function(){
      //showlog('ChannelEntryView:initialize');
      this.template = _.template( $('#channel_entry_template').html() );

      var folders = this.model.folders
        , events = this.model.events
        , $eventList = $('#event_list')
        , $folderList = $('#folder_list');
        ; 
      this.model.on('destroy', function(){
        $folderExplorer.empty();
        $folderList.empty();
        $eventList.empty();
      });
      /* Folders collection. */
      folders.on('destroy', function(/*mod,col,opts*/){
        showlog('channel.folders->destroy');
        folders.fetch();
      });
      folders.on('reset', function(){
        showlog('channel.folders->reset'); 
        var $folderExplorer = this.$('.folder_explorer');
        $folderExplorer.empty();
        $folderList.empty();
        folders.each(function(e){
          $folderExplorer.append(
            new window.app.FolderExplorerView({
                model:e
              , channel: this.model
            }).render().$el
          );
          $folderList.append(
            new window.app.FolderEntryView({model:e}).render().$el
          );
        }, this);
        $folderExplorer.toggle(!$folderExplorer.is(':visible'));
      }, this);
      /* Events collection. */
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
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){
      //showlog('ChannelEntryView:render',this.model.toJSON());
      this.$el.append( this.template( this.model.toJSON() ) );
      this.$el.find('.channel').toggleClass('pull-right', window.app.channelEditMode);
      this.$el.find('.delete').toggle( window.app.channelEditMode );
      this.$el.find('.edit').toggle( window.app.channelEditMode );
      return this;
    }
    , onClick: function(){
      var channelId = this.model.get('id');
      showlog('ChannelEntryView:onClick',channelId);  
      /* Add selected class. */
      $('#channel_list a').removeClass('selected');
      this.$('a:last').addClass('selected');
      /* Store current focused channel. */
      window.app.currentChannel = this.model;
      window.app.currentLeftElement = {type:"channel", model:this.model};
      /* We're in the channel, no folder filter. */
      window.app.currentChannel.events.onlyFolders = [];
      /* Reload folders and events. */
      this.model.events.fetch();
      this.model.folders.fetch();
      return false;
    }
    , onClickDelete: function(){
      showlog('ChannelEntryView:onClickDelete', this.model.get('id'));
      this.model.destroy({wait:true});
      return false;
    }
    , onClickEdit: function(){
      /* Select the channel to edit. */
      this.onClick();
      /* Open modal. */
      $('#edit_channel_form #name').val(this.model.get('name'));
      $('#edit_channel_modal').modal();
      return false;
    }
  });

  window.app.FolderExplorerView = Backbone.View.extend({
    tagName: 'li'
    , initialize: function(){
      //showlog('FolderExplorerView:initialize');
      this.template = _.template( $('#folder_explorer_template').html() );

      var folders = this.model.folders
        , $folderList = $('#folder_list')
        , $eventList = $('#event_list');

      /* Folders collection. */
      folders.on('destroy', function(/*mod,col,opts*/){
        showlog('folder.folders->destroy');
        folders.fetch();
      });
      folders.on('reset', function(){
        showlog('folder.folders->reset'); 
        var $subfolderExplorer = this.$('.subfolder_explorer');
        $subfolderExplorer.empty();
        $folderList.empty();
        folders.each(function(e){
          $subfolderExplorer.append(
            new window.app.FolderExplorerView({
                model:e
              , channel: this.options.channel
            }).render().$el
          );
          $folderList.append(
            new window.app.FolderEntryView({model:e}).render().$el
          );
        }, this);
        $subfolderExplorer.toggle(!$subfolderExplorer.is(':visible'));
      }, this);
    }
    , events: {
      'click .channel' : 'onClick'
    }
    , render: function(){
      //showlog('FolderExplorerView:render');
      this.$el.append( this.template( this.model.toJSON() ) );

      var $subfolderExplorer = this.$('.subfolder_explorer');
      $subfolderExplorer.empty();
      this.model.folders.each(function(e){
        $subfolderExplorer.append(
          new window.app.FolderExplorerView({
              model:e
            , channel: this.options.channel
          }).render().$el
        );
      }, this);
      return this;
    }
    , onClick: function(){
      var folderId = this.model.get('id');
      window.app.currentLeftElement = {type:"folder", model:this.model};
      /* We're in a folder, set the folder filter. */
      window.app.currentChannel.events.onlyFolders = [folderId];
      showlog('FolderExplorerView:onClick',folderId);  
      /* Add selected class. */
      $('#channel_list a').removeClass('selected');
      this.$('a:first').addClass('selected');
      /* Toggle subfolder explorer. */
      var $subfolderExplorer = this.$('.subfolder_explorer:first');
      $subfolderExplorer.toggle(!$subfolderExplorer.is(':visible'));
      /* Update folder list view. */
      var $folderList = $('#folder_list');
      $folderList.empty();
      this.model.folders.each(function(e){
        $folderList.append(
          new window.app.FolderEntryView({model:e}).render().$el
          );
      });
      /* Get events. */
      this.options.channel.events.fetch();

      return false;
    }
  });

  window.app.FolderEntryView = Backbone.View.extend({
    tagName: 'tr'
    , initialize: function(){
      //showlog('FolderEntryView:initialize');
      this.template = _.template( $('#folder_entry_template').html() );
    }
    , events: {
        'click .delete'   : 'onClickDelete'
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){
      //showlog('FolderEntryView:render');
      this.$el.append( this.template( this.model.toJSON() ) );
      if (window.app.eventEditMode){
        this.$('.delete').show();
        this.$('.edit').show();
      }
      return this;
    }
    , onClickDelete: function(){
      var eventId = this.model.get('id');
      showlog('FolderEntryView:onClickDelete', eventId);
      this.model.destroy({wait:true});
      return false;
    }
    , onClickEdit: function(){
      window.app.currentFolder = this.model;
      var folderId = this.model.get('id');
      showlog('FolderEntryView:onClickEdit', folderId);
      $('#edit_folder_form #name').val(this.model.get('name'));
      $('#edit_folder_modal').modal();
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
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){
      //showlog('EventEntryView:render');
      var data = this.model.toJSON();
      data.value = JSON.stringify( data.value );
      this.$el.append( this.template( data ) );
      if (window.app.eventEditMode){
        this.$('.delete').show();
        this.$('.edit').show();
      }
      return this;
    }
    , onClickDelete: function(){
      var eventId = this.model.get('id');
      showlog('EventEntryView:onClickDelete', eventId);
      this.model.destroy({wait:true});
      return false;
    }
    , onClickEdit: function(){
      window.app.currentEvent = this.model;
      var eventId = this.model.get('id');
      showlog('EventEntryView:onClickEdit', eventId);
      $('#edit_event_form #comment').val(this.model.get('comment'));
      $('#edit_event_modal').modal();
      return false;
    }
  });

  window.app.ExplorerView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      showlog('ExplorerView:initialize');
      window.app.channelEditMode = window.app.eventEditMode = false;
      this.template = _.template( $('#explorer_view_template').html() ); 
      /* Events. */
      this.collection.on('reset', _.bind(function(col,opts){
        showlog('ExplorerView::channels->reset');
        col.each(function(channel){
          /* Folders collection. */
          channel.folders.on('reset', function(){
            showlog('ExplorerView::channel.folders->reset');
            /* Dont show edit toggle if no events. */
            if (window.app.currentChannel !== undefined) {
              this.$showAddFolderBtn.show();
            }
            if (channel.folders.size()){
              this.$toggleEditFolders.show();
            } else {
              this.$toggleEditFolders.hide();
              if (window.app.folderEditMode){
                this.onClickToggleEditFolders(null, false);
              }
            }
          }, this);
          /* Events collection. */
          channel.events.on('reset', function(){
            showlog('ExplorerView::channel.events->reset');
            /* Dont show edit toggle if no events. */
            if (window.app.currentChannel !== undefined) {
              this.$showAddEventBtn.show();
            }
            if (channel.events.size()){
              this.$toggleEditEvents.show();
            } else {
              this.$toggleEditEvents.hide();
              if (window.app.eventEditMode){
                this.onClickToggleEditEvents(null, false);
              }
            }
          }, this);
        }, this);
        /* Channel Rendering.  */ 
        this.renderCollection();
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
      , 'click #show_add_folder_modal_btn'  : 'onClickShowAddFolderModalBtn'
      , 'click #show_add_event_modal_btn'   : 'onClickShowAddEventModalBtn' 
      , 'click #toggle_edit_channels_btn'   : 'onClickToggleEditChannels'
      , 'click #toggle_edit_folders_btn'    : 'onClickToggleEditFolders'
      , 'click #toggle_edit_events_btn'     : 'onClickToggleEditEvents'
      , 'click #add_channel_form #save_btn' : 'onClickSaveChannelBtn'
      , 'click #add_folder_form #save_btn'  : 'onClickSaveFolderBtn'
      , 'click #add_event_form #save_btn'   : 'onClickSaveEventBtn'
      , 'click #edit_channel_form #save_btn': 'onClickSaveChangesChannelBtn'
      , 'click #edit_folder_form #save_btn': 'onClickSaveChangesFolderBtn'
      , 'click #edit_event_form #save_btn'  : 'onClickSaveChangesEventBtn'
    }
    , render : function(){
      showlog('ExplorerView:render');
      this.$el.html( this.template() );
      /* Shortcuts. */
      this.$channelList           = this.$('#channel_list');
      this.$folderList            = this.$('#folder_list');
      this.$eventList             = this.$('#event_list');
      this.$toggleEditChannels    = this.$('#toggle_edit_channels_btn');
      this.$toggleEditFolders     = this.$('#toggle_edit_folders_btn');
      this.$toggleEditEvents      = this.$('#toggle_edit_events_btn');
      this.$addChannel            = this.$('#add_channel_modal');
      this.$addFolder             = this.$('#add_folder_modal');
      this.$addEvent              = this.$('#add_event_modal');
      this.$newChannelInput       = this.$('#add_channel_form #name');
      this.$newFolderInput        = this.$('#add_folder_form #name');
      this.$newEventComment       = this.$('#add_event_form #comment');
      this.$newEventValue         = this.$('#add_event_form #value');
      this.$editChannelModal      = this.$('#edit_channel_modal');
      this.$editFolderModal       = this.$('#edit_folder_modal');
      this.$editEventModal        = this.$('#edit_event_modal');
      this.$editChannelInput      = this.$('#edit_channel_form #name');
      this.$editFolderInput       = this.$('#edit_folder_form #name');
      this.$editEventCommentInput = this.$('#edit_event_form #comment');
      this.$showAddEventBtn       = this.$('#show_add_event_modal_btn');
      this.$showAddFolderBtn      = this.$('#show_add_folder_modal_btn');
      this.$showAddChannelBtn     = this.$('#show_add_channel_modal_btn');

      var _postInit = _.bind(function(){
        this.collection.fetch();
      }, this);

      /* Check if token is in local storage. */
      window.app.token = store.get('token');
      if (!window.app.token){
        /* Get tokens. */
        $.ajaxSetup({
          beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization',window.app.sessionID);
          }
        });
        var url = window.app.baseApiUrl+'/admin/tokens';
        $.getJSON(url)
          .success(function(res){
            window.app.serverNow = res.serverNow;
            window.app.token = res.tokens[0].id;
            /* Init local storage with latest app data. */
            store.set('token', window.app.token);
            _postInit();
          })
        ;
      } else {
        /* Init app with local storage data. */
        window.app.sessionID = store.get('sessionID');
        window.app.token = store.get('token');
        window.app.username = store.get('username');
        window.app.baseApiUrl = store.get('baseApiUrl');
        _postInit();
      }
      return this;
    }
    , renderCollection : function(){
      showlog('ExplorerView:renderCollection');
      this.$channelList.empty();
      /* Dont show edit toggle if no channel. */
      if (this.collection.size()){
        this.$toggleEditChannels.show();
        this.$showAddChannelBtn.show();
      } else {
        this.$toggleEditChannels.hide();
        this.$showAddChannelBtn.hide();
        if (window.app.channelEditMode){
          this.onClickToggleEditChannels(null, false);
        }
      }
      this.collection.each(function(channel){ 
        /* Fill channels. */
        this.$channelList.append(
          new window.app.ChannelEntryView({model: channel}).render().$el
        );
      }, this);
    }
    , switchOffEditModes : function(){
      this.onClickToggleEditChannels(null, false);
      this.onClickToggleEditFolders(null, false);
      this.onClickToggleEditEvents(null, false);
    }
    , onClickShowAddChannelModalBtn  : function(e){
      showlog('ExplorerView:onClickShowAddChannelModalBtn');
      this.switchOffEditModes();
      this.$addChannel.modal();
      return false;
    }
    , onClickShowAddFolderModalBtn  : function(e){
      showlog('ExplorerView:onClickShowAddFolderModalBtn');
      this.switchOffEditModes();
      this.$addFolder.modal();
      return false;
    }
    , onClickShowAddEventModalBtn  : function(e){
      showlog('ExplorerView:onClickShowAddEventModalBtn');
      this.switchOffEditModes();
      this.$addEvent.modal();
      return false;
    }
    , onClickToggleEditChannels: function(e, flag){
      /* Toggle edit mode. */
      window.app.channelEditMode = (flag !== undefined) ? flag :
        !window.app.channelEditMode;
      flag = window.app.channelEditMode;
      showlog('ExplorerView:onClickToggleEditChannels', e, flag);
      /* Simulated click? */
      if (e) { 
        this.onClickToggleEditEvents(null, false);
        this.onClickToggleEditFolders(null, false);
      }
      this.$toggleEditChannels.toggleClass('btn-primary', flag);
      this.$toggleEditChannels.find('i')
        .toggleClass('icon-edit', !flag)
        .toggleClass('icon-ok', flag);
      this.$('.channel').toggleClass('pull-right', flag);
      this.$('#channel_list .delete').toggle(flag);
      this.$('#channel_list .edit').toggle(flag);
      return false;
    }
    , onClickToggleEditFolders: function(e, flag){
      /* Toggle edit mode. */
      window.app.folderEditMode = (flag !== undefined) ? flag :
        !window.app.folderEditMode;
      flag = window.app.folderEditMode;
      showlog('ExplorerView:onClickToggleEditFolders', e, flag);
      /* Simulated click? */
      if (e) {
        this.onClickToggleEditChannels(null, false);
        this.onClickToggleEditEvents(null, false);
      }
      this.$toggleEditFolders.toggleClass('btn-primary', flag);
      this.$toggleEditFolders.find('i')
        .toggleClass('icon-edit', !flag)
        .toggleClass('icon-ok', flag);
      this.$('#folder_list .delete').toggle(flag);
      this.$('#folder_list .edit').toggle(flag);
      return false;
    }
    , onClickToggleEditEvents: function(e, flag){
      /* Toggle edit mode. */
      window.app.eventEditMode = (flag !== undefined) ? flag :
        !window.app.eventEditMode;
      flag = window.app.eventEditMode;
      showlog('ExplorerView:onClickToggleEditEvents', e, flag);
      /* Simulated click? */
      if (e) {
        this.onClickToggleEditChannels(null, false);
        this.onClickToggleEditFolders(null, false);
      }
      this.$toggleEditEvents.toggleClass('btn-primary', flag);
      this.$toggleEditEvents.find('i')
        .toggleClass('icon-edit', !flag)
        .toggleClass('icon-ok', flag);
      this.$('#event_list .delete').toggle(flag);
      this.$('#event_list .edit').toggle(flag);
      return false;
    }
    , onClickSaveChannelBtn  : function(e){
      showlog('ExplorerView:onClickSaveChannelBtn');
      this.collection.create(
        { name:this.$newChannelInput.val() },
        {
          success:_.bind(function(channel){
            showlog('success creating new channel',arguments);
            this.$newChannelInput.val('');
            this.$addChannel.modal('hide');
            this.collection.fetch();
          }, this)
        }    
      );
      return false;
    }
    , onClickSaveFolderBtn  : function(e){
      showlog('ExplorerView:onClickSaveFolderBtn');
      var folders = window.app.currentLeftElement.model.folders;
      folders.create(
        { name:this.$newFolderInput.val() },
        {
          success:_.bind(function(channel){
            showlog('success creating new folder',arguments);
            this.$newFolderInput.val('');
            this.$addFolder.modal('hide');
            folders.fetch();
          }, this)
        }    
      );
      return false;
    }
    , onClickSaveEventBtn  : function(e){
      var comment = this.$newEventComment.val()
        , value = JSON.parse(this.$newEventValue.val());
      
      var data = { comment:comment, value:value }; 
      /* Add folderId if adequate. */
      if (window.app.currentLeftElement.type === 'folder'){
        data.folderId = window.app.currentLeftElement.model.get('id'); 
      }
      showlog('ExplorerView:onClickSaveEventBtn',data);

      window.app.currentChannel.events.create(
        data, 
        {
          success:_.bind(function(event){
            showlog('success creating new event',arguments);
            this.$newEventComment.val('');
            this.$addEvent.modal('hide');
            window.app.currentChannel.events.fetch();
          }, this)
        }
      );
      return false;
    }
    , onClickSaveChangesChannelBtn  : function(e){
      showlog('ExplorerView:onClickSaveChangesChannelBtn');
      window.app.currentChannel.save(
        { name:this.$editChannelInput.val() },
        {
          success:_.bind(function(channel){
            showlog('success editing channel',arguments);
            this.$editChannelInput.val('');
            this.$editChannelModal.modal('hide');
            this.collection.fetch();
          }, this)
        }    
      );
      return false;
    }
    , onClickSaveChangesFolderBtn  : function(e){
      showlog('ExplorerView:onClickSaveChangesFolderBtn',_.clone(window.app.currentFolder));
      var folder = window.app.currentFolder;
      folder.save(
        { name:this.$editFolderInput.val() },
        {
          success:_.bind(function(channel){
            showlog('success editing folder',arguments);
            this.$editFolderInput.val('');
            this.$editFolderModal.modal('hide');
            window.app.currentLeftElement.model.folders.fetch();
          }, this)
        }    
      );
      return false;
    }
    , onClickSaveChangesEventBtn  : function(e){
      showlog('ExplorerView:onClickSaveChangesEventBtn', e);
      window.app.currentEvent.save(
        {
            comment:this.$editEventCommentInput.val()
        }, 
        {
          success:_.bind(function(event){
            showlog('success editing event',arguments);
            this.$editEventCommentInput.val('');
            this.$editEventModal.modal('hide');
            window.app.currentChannel.events.fetch();
          }, this)
        }
      );
      return false;
    }
    , onClickSignoutBtn  : function(e){
      showlog('ExplorerView:onClickSignoutBtn');
      store.clear();
      window.location.href = window.location.pathname; 
      return false;
    }
  });
})()
