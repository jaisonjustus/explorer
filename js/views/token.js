(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.TokenView = Backbone.View.extend({
    /* Variables */
      id: '#tab'
    , template: '#tab_view'
    , tokensByUsername: {}
    , views: null
    , modals: null
    , name:'TokenView'
    /* Methods */
    , initialize: function(){
      this.template = _.template($(this.template).html());
      this.views = {
          channels: new ChannelsView({})
        , events: new EventsView({})
        , folders: new FoldersView({})
      }
      this.views.channels.on('click', this.updateFoldersAndEvents, this);
      this.views.folders.on('click', this.updateEvents, this);

      this.modals = {
          tokenSettings: new TokenSettingsModal({
            tokensByUsername:this.tokensByUsername
        })
      };
      this.modals.tokenSettings.on('save', this.saveTokenSettings, this);
    }
    , events: {
      'click #settings_btn' : 'onClickSettingsBtn'
    }
    , render: function(){
      window.app.sessionId = store.get('sessionId');
      window.app.appToken = store.get('appToken');
      window.app.username = store.get('username');
      window.app.baseApiUrl = store.get('baseApiUrl');
      if (!window.app.sessionId || 
          !window.app.appToken || 
          !window.app.username || 
          !window.app.baseApiUrl){
        return this.trigger('signOut');
      }

      var _attach = function(that){
        that.setElement(that.id);
        that.$el.html( that.template()); 
        that.$('#settings_btn').show();
        that.$('#folders').show();
        that.$('#events').show();
      };
      var _renderChannels = function(that){
        /* Rebuild channels. */
        that.views.channels.rebuild( that.tokensByUsername );
      }
      var _processUserTokens = function(){
        _attach(this);
        /* Manually add the app token to the user tokens. */
        /* Main user token is active by default. */
        this.tokensByUsername[ window.app.username ].unshift(window.app.appToken);
        this.tokensByUsername[ window.app.username ].at(0).active = true;
        _renderChannels(this);
      };

      if (!this.tokensByUsername[ window.app.username ]) {
        this.tokensByUsername[ window.app.username ] = 
          new window.app.Tokens([], {
              sessionId: window.app.sessionId
            , baseApiUrl: window.app.baseApiUrl
          });
        this.tokensByUsername[ window.app.username ]
          .on('reset', _processUserTokens, this)
          .fetch()
          ;
      } else {
        _attach(this);
        _renderChannels(this);
      } 
    
      return this;
    }
    , saveTokenSettings: function(){
      this.modals.tokenSettings.close();
      this.views.channels.rebuild( this.tokensByUsername );
    } 
    , updateFoldersAndEvents: function(channel){
      var channelId = channel.get('id');
      this.views.events.rebuild({ 
        channelId: channelId, 
        folderId: '', 
        token: channel.collection.token, 
        baseApiUrl: channel.collection.baseApiUrl
      });
      this.views.folders.rebuild({
        channelId: channelId, 
        parentId: channelId, 
        token: channel.collection.token, 
        baseApiUrl: channel.collection.baseApiUrl
      });
    }
    , updateEvents: function(folder){
      var folderId = folder.get('id');
      var options = { 
        channelId: folder.collection.channelId, 
        folderId: folderId, 
        token: folder.collection.token, 
        onlyFolders: [folderId],
        baseApiUrl: folder.collection.baseApiUrl
      };
      showlog(this.name+':updateEvents',folder,options);
      this.views.events.rebuild( options );
    }
    , onClickSettingsBtn: function(){
      this.modals.tokenSettings.render();
      return false;
    }
  });

  var ChannelsView = Backbone.View.extend({
    /* Variables */
      id: '#channels'
    , collections: []
    , name: 'ChannelsView'
    , $channelList: null
    /* Methods */
    , initialize: function(){
    }
    , events : {
    }
    , render: function(){
      this.setElement(this.id); 
      this.$channelList = this.$('#channel_list');
      return this;
    }
    , rebuild: function(tokensByUsername){
      /* Attach to Dom. */
      this.render();
      /* Empty channels. */
      this.$channelList.empty();
      this.collections = [];
      /* Rebuild. */
      _.each(tokensByUsername, function(tokens, username){
        tokens.each(function(token){
          if (token.active) {
            /* Add. */
            var col = new window.app.TokenChannels([], {
              token:token.get('id'), baseApiUrl:token.baseApiUrl(username)
            });
            col
              .on('reset', this.renderCollection, this)
              .fetch()
              ;
            this.collections.push( col );
          }
        }, this);
      }, this);
    }
    , renderCollection: function(col){
      col.each(function(channel){
        var channelView = new ChannelView({model: channel});
        this.$channelList.append(
          channelView.render().$el
        );
        /* Bubble up click envent. */
        channelView.on('click', function(){
          this.$('.channel_container').removeClass('selected');
          channelView.$('.channel_container').addClass('selected');
          this.trigger('click', channelView.model);
        }, this);
      }, this);
    }
  });

  var ChannelView = Backbone.View.extend({
    /* Variables */
      model: null
    , tagName:'li'
    , template: '#channel_view'
    , name: 'ChannelView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
    }
    , events: {
        'click .channel'  : 'onClick'
    }
    , render: function(){
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
    , onClick: function(){
      showlog(this.name+':onClick',this.model.get('id'));  
      this.trigger('click');
      return false;
    }
  });

  var Modal = Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , template: null
    , $modal: null
    /* Methods */
    , initialize: function(){
      this.template = _.template($(this.templateId).html());
    } 
    , render: function(){
      this.setElement(this.id);
      this.$el.html(this.template());
      this.$modal = this.$(this.templateId).modal();
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.undelegateEvents();
      this.$modal.modal('hide');
    }
  });

  var TokenSettingsModal = Modal.extend({
    /* Variables */
      templateId: '#token_settings_modal'
    , tokenViewTemplId: '#token_view'
    , tokenViewTempl: null
    , tokensByUsername: null
    , name: 'TokenSettingsModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
      this.tokenViewTempl = _.template($(this.tokenViewTemplId).html());
      this.tokensByUsername = this.options.tokensByUsername;
    } 
    , events: {
        'click #save_btn' : 'onClickSaveBtn' 
      , 'click #add_btn'  : 'onClickAddBtn'
    }
    , render: function(){
      Modal.prototype.render.call(this);

      this.$tokenList = this.$('#token_list');
      this.$name = this.$('#name');

      _.each(this.tokensByUsername, function(tokens, username){
        tokens.each(function(token){
          this.$tokenList.prepend(
            this.tokenViewTempl({
                username:username
              , id:token.get('id')
              , checked:token.active
            })  
          );
        }, this);
      }, this);      

      return this;
    }
    , close: function(){
      Modal.prototype.close.call(this);
      this.$name.val('');
    }
    , onClickSaveBtn: function(){
      showlog(this.name+':onClickSaveBtn');
      var tokensByUsername = this.tokensByUsername;
      this.$('input[type=checkbox]').parents('tr').each(function(){
        var $this = $(this);
        var username = $this.find('.username').text();
        var id = $this.find('.token').text();
        var checked = $this.find('input[type=checkbox]').is(':checked');
        if(!tokensByUsername[username]){
          tokensByUsername[username] = new window.app.Tokens([{id:id}], {});
        } else if (!tokensByUsername[username].get(id)){
          tokensByUsername[username].add({id:id});
        }
        tokensByUsername[username].get(id).active = checked;
      });
      this.trigger('save');
      return false; 
    }
    , onClickAddBtn: function(){
      showlog(this.name+':onClickAddBtn');
      this.$tokenList.prepend(
        this.tokenViewTempl({
            username:this.$('#from').val()
          , id:this.$('#token').val()
          , checked:true
        })  
      );
      return false; 
    }
  });

  var EventsView = Backbone.View.extend({
    /* Variables */
      id: '#events'
    , collection: null
    , name: 'EventsView'
    , $eventList: null
    , modals: null
    /* Methods */
    , initialize: function(){
      this.modals = {
          edit: new EditEventModal()
        , add: new AddEventModal()
      }
      this.modals.edit.on('save', this.saveEvent, this);
      this.modals.add.on('save', this.createEvent, this);
    }
    , events : {
      'click #add_event_modal_btn':'onClickAddEventBtn'
    }
    , render: function(){
      this.setElement(this.id); 
      this.$eventList = this.$('#event_list');
      return this;
    }
    , rebuild: function(options){
      //showlog(this.name+':rebuild',options);
      /* Attach to Dom. */
      this.render();
      /* Show Add button. */
      $('#add_event_modal_btn').show();
      /* Empty events. */
      this.collection = 
        new window.app.Events([], options)
          .on('reset', this.renderCollection, this)
          ;
      /* Rebuild. */
      this.refresh();
    }
    , refresh: function() {
      this.$eventList.empty();
      this.collection.fetch();
    }
    , renderCollection: function(){
      this.collection.each(function(event){
        var eventView = 
          new EventView({model: event})
            .on('edit', this.openEditModal, this)
            .on('delete', this.deleteEvent, this)
            ;
        this.$eventList.append( eventView.render().$el );
      }, this);
    }
    , openEditModal: function(event){
      showlog(this.name+':openEditModal');
      this.modals.edit.setModel( event ).render();
    }
    , createEvent: function(comment){
      this.collection.create({
          comment: comment
        , folderId: this.collection.folderId
        },
        {
          success:_.bind(function(event){
            showlog('success creating event');
            this.refresh();
            this.modals.add.close();
          }, this)
        }
      );
    }
    , saveEvent: function(event, comment){
      showlog(this.name+':saveEvent');
      event.save(
        {
            comment:comment
          , folderId: this.collection.folderId
        }, 
        {
          success:_.bind(function(event){
            showlog('success saving event');
            this.refresh();
            this.modals.edit.close();
          }, this)
        }
      );
    }
    , deleteEvent: function(event){
      event.destroy({success:_.bind(function(){
          this.refresh();
        }, this)
      });
    }
    , onClickAddEventBtn: function(){
      this.modals.add.render();
    }
  });

  var EventView = Backbone.View.extend({
    /* Variables */
      tagName:'tr'
    , template: '#event_view'
    , model: null
    , name: 'EventView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
    }
    , events: {
        'click .delete'   : 'onClickDelete'
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){
      /* Stringify JSON object. */
      var data = this.model.toJSON();
      data.value = JSON.stringify(data.value);
      this.$el.html( this.template( data ) );
      return this;
    }
    , onClickDelete: function(){
      showlog(this.name+':onClickDelete', this.model.get('id'));
      this.trigger('delete', this.model);
      return false;
    }
    , onClickEdit: function(){
      showlog(this.name+':onClickEdit', this.model.get('id'));
      /* Open modal. */
      this.trigger('edit', this.model);
      return false;
    }
  });

  var EditEventModal = Modal.extend({
    /* Variables */
      templateId: '#edit_event_modal'
    , name: 'EditEventModal'   
    , model: null
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn' : 'onClickSaveBtn' 
    }
    , render: function(){
      Modal.prototype.render.call(this);
      this.$('#comment').val( this.model.get('comment') );
      return this;
    }
    , setModel: function(model) {
      this.model = model;
      return this;
    }
    , onClickSaveBtn: function(){
      this.trigger('save', this.model, this.$('#comment').val());
      return false; 
    }
  });

  var AddEventModal = Modal.extend({
    /* Variables */
      templateId: '#add_event_modal'
    , name: 'AddEventModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn' : 'onClickSaveBtn' 
    }
    , render: function(){
      Modal.prototype.render.call(this);
      return this;
    }
    , onClickSaveBtn: function(){
      this.trigger('save', this.$('#comment').val());
      return false; 
    }
  });

  var FoldersView = Backbone.View.extend({
    /* Variables */
      id: '#folders'
    , collection: null
    , name: 'FoldersView'
    , modals: null
    , $folderList: null
    , selected: null
    /* Methods */
    , initialize: function(){
      this.modals = {
          add: new AddFolderModal()
        , edit: new EditFolderModal()
      };
      this.modals.add.on('saveAdd', this.createFolder, this);
      this.modals.edit.on('saveEdit', this.saveFolder, this);
    }
    , events : {
      'click #add_folder_modal_btn':'onClickAddFolderBtn'
    }
    , render: function(){
      this.setElement(this.id); 
      this.$folderList = this.$('#folder_list');
      return this;
    }
    , rebuild: function(options){
      /* Attach to Dom. */
      this.render();
      /* Show Add button. */
      $('#add_folder_modal_btn').show();
      /* Empty collection. */
      $('#add_event_modal_btn').show();
      this.collection = new window.app.Folders([], options)
        .on('reset', this.renderCollection, this)
        ;
      this.refresh();
    }
    , refresh: function(){
      showlog(this.name+":refresh");
      /* Clean up and fetch new data. */
      this.$('#folder_list').empty();
      this.selected = null;
      this.collection.fetch();
    }
    , renderCollection: function(col){
      col.each(function(folder){

        /* Recursively display folders. */
        (function recursive(folder, $folder, that){
          var folderView = 
            new FolderView({model: folder})
              .on('click', that.click, that )
              .on('edit', that.edit, that )
              .on('delete', that.deleteFolder, that )
              ;
          $folder.append(
            folderView.render().$el
          );
          folder.folders.each(function(subfolder){
            recursive(subfolder, folderView.$('.folder:first'), that);
          });
        })(folder, this.$folderList, this);  
      }, this);
    }
    , click: function(folderView){
      this.$('.folder_container').removeClass('selected');
      folderView.$('.folder_container:first').addClass('selected');
      this.selected = folderView;
      showlog(this.name+':click',folderView.model.get('id'),this.selected);
      this.trigger('click', folderView.model);
    }
    , saveFolder: function(folder, name){
      showlog(this.name+':saveFolder');
      folder.save({
        name: name
      },
      {
        success:_.bind(function(){
          showlog('success saving folder');
          this.refresh();
          this.modals.edit.close();
        }, this)
      });
    }
    , createFolder: function(name){
      showlog(this.name+':createFolder');
      var col = (this.selected) ? 
        this.selected.model.folders : this.collection;

      col.create(
        {
          name: name
        },
        {
          success:_.bind(function(event){
            showlog('success creating folder');
            this.refresh();
            this.modals.add.close();
          }, this)
        }
      );
    }
    , deleteFolder: function(folder){
      showlog(this.name+':deleteFolder');
      folder.destroy({success:_.bind(function(){
        this.refresh();
      }, this)
      });
    }
    , edit: function(folder){
      this.modals.edit.setModel( folder ).render();
    }
    , onClickAddFolderBtn: function(){
      this.modals.add.render();
    }
  });

  var FolderView = Backbone.View.extend({
    /* Variables */
      model: null
    , tagName:'li'
    , template: '#folder_view'
    , name: 'FolderView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
    }
    , events: {
        'click .folder_container' : 'onClick'
      , 'click .edit'             : 'onEdit'
      , 'click .delete'           : 'onDelete'
    }
    , render: function(){
      this.$el.append( this.template( this.model.toJSON() ) );
      return this;
    }
    , onClick: function(){
      showlog(this.name+':onClick',this.model.get('id'));  
      this.trigger('click', this);
      return false;
    }
    , onEdit: function(){
      showlog(this.name+':onEdit',this.model.get('id'));  
      this.trigger('edit', this.model);
      return false;
    }
    , onDelete: function(){
      showlog(this.name+':onDelete',this.model.get('id'));  
      this.trigger('delete', this.model);
      return false;
    }
  });

  var EditFolderModal = Modal.extend({
    /* Variables */
      templateId: '#edit_folder_modal'
    , name: 'EditFolderModal'   
    , model: null
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn' : 'onClickSaveBtn' 
    }
    , render: function(){
      Modal.prototype.render.call(this);
      this.$('#name').val( this.model.get('name') );
      return this;
    }
    , setModel: function(model) {
      this.model = model;
      return this;
    }
    , onClickSaveBtn: function(){
      this.trigger('saveEdit', this.model, this.$('#name').val());
      return false; 
    }
  });

  var AddFolderModal = Modal.extend({
    /* Variables */
      templateId: '#add_folder_modal'
    , name: 'AddFolderModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn' : 'onClickSaveBtn' 
    }
    , render: function(){
      Modal.prototype.render.call(this);
      return this;
    }
    , onClickSaveBtn: function(){
      this.trigger('saveAdd', this.$('#name').val());
      return false; 
    }
  });
})()
