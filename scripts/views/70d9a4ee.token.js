define(['jquery', 'underscore', 'backbone', 'store', 'accesses', 'events', 'folders', 'token_channels', 'bootstrap', 'jquery.fileupload'], function($, _, Backbone, Store, Accesses, Events, Folders, TokenChannels) {
  'use strict';

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
    , rebuild: function(accessesByUsername){
      /* Attach to Dom. */
      this.render();
      /* Empty channels. */
      this.$channelList.empty();
      this.collections = [];
      /* Rebuild. */
      _.each(accessesByUsername, function(accesses, username){
        accesses.each(function(access){
          if (access.active) {
            /* Add. */
            var col = new TokenChannels([], {
                token:access.get('token')
              , baseApiUrl:access.baseApiUrl(username)
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

  var AddEventModal = Modal.extend({
    /* Variables */
      templateId: '#add_event_modal'
    , mode: 'mark'
    , name: 'AddEventModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn'   : 'onClickSaveBtn' 
      , 'click #start_btn'  : 'onClickStartBtn' 
      , 'click #stop_btn'   : 'onClickStopBtn' 
      , 'change #event_mode': 'onChangeEventMode'
    }
    , render: function(){
      /* Override Modal so that you can't close it. */
      this.setElement(this.id);
      this.$el.html(this.template());
      this.$modal = this.$(this.templateId).modal({backdrop:'static'});
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.$('#stop_btn').hide();
      this.$('#start_btn').show();
      this.$('#cancel_btn').show();
      Modal.prototype.close.call(this);
    }
    , onChangeEventMode: function(){
      // console.log(this.name + ':onChangeEventMode');
      this.$('.optional').hide();
      var selected = this.$('#event_mode > option:selected').attr('id');
      this.$('.'+selected+'_btn').show();
    }
    , onClickSaveBtn: function(){
      this.trigger('save', this.$('#comment').val(), this.$('#value').val());
      return false; 
    }
    , onClickStartBtn: function(){
      this.$('#start_btn').hide();
      this.$('#cancel_btn').hide();
      this.$('#value').attr('disabled', 'disabled');
      this.$('#comment').attr('disabled', 'disabled');
      this.$('#stop_btn').show();
      this.trigger('start', this.$('#comment').val(), this.$('#value').val());
      /* Small counter to help timing events. */
      this.interval = setInterval(function(time){
        var time = parseInt($('#timer').text());
        time += 1;
        $('#timer').text(time.toString()+' s.');
      }, 1000)
      return false;
    }
    , onClickStopBtn: function(){
      /* Stop counter. */
      window.clearInterval(this.interval);
      this.trigger('stop');
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
        'click #save_btn'   : 'onClickSaveBtn'
    }
    , render: function(){
      Modal.prototype.render.call(this);
      this.$('#comment').val( this.model.get('comment') );
      this.$('#value').val( JSON.stringify(this.model.get('value')) );

      this.$('#file_upload').fileupload({
        dataType: 'json',
        add: _.bind(function(e, data){
          this.$('#file_upload').attr('name',data.files[0].name);
          data.url = this.model.url()+'?auth='+this.model.collection.token,
          console.log('Adding',data);
          data.submit(); 
        },this),
        error: function(o){
          console.log('Error',o);
        },
        done: function(e, data){
          console.log('Done',data); 
        }
      });
      return this;
    }
    , setModel: function(model) {
      this.model = model;
      return this;
    }
    , onClickSaveBtn: function(){
      this.trigger(
          'save'
        , this.model
        , this.$('#comment').val()
        , this.$('#value').val()
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
    , runningEvent: null
    , modals: null
    /* Methods */
    , initialize: function(){
      this.modals = {
          edit: new EditEventModal()
        , add: new AddEventModal()
      }
      this.modals.edit
        .on('save', this.saveEvent, this)
        ;
      this.modals.add.on('save', this.createEvent, this);
      this.modals.add.on('start', this.startEvent, this);
      this.modals.add.on('stop', this.stopEvent, this);
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
      //console.log(this.name+':rebuild',options);
      /* Attach to Dom. */
      this.render();
      /* Show Add button. */
      $('#add_event_modal_btn').show();
      /* Empty events. */
      this.collection = 
        new Events([], options)
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
      console.log(this.name+':openEditModal');
      this.modals.edit.setModel( event ).render();
    }
    , createEvent: function(comment, value){
      this.collection.create(
        {
            comment: comment
          , value: JSON.parse(value)
          , folderId: this.collection.folderId
        },
        {
          success:_.bind(function(event){
            console.log('success creating mark event');
            this.refresh();
            this.modals.add.close();
          }, this)
        }
      );
    }
    , startEvent: function(comment, value){
      this.collection.create(
        {
            comment: comment
          , value: JSON.parse(value)
          , folderId: this.collection.folderId
          , duration: null
        },
        {
          success: function(event){
            console.log('success creating duration event');
          }
        }
      );
    }
    , stopEvent: function(){
      this.collection.stopCurrentEvent(_.bind(function(data, status, xhr){
          console.log('success stopping event');
          this.refresh();
          this.modals.add.close();
        }, this)
      );
    }
    , saveEvent: function(event, comment, value){
      event.save(
        {
            comment:comment
          , value: JSON.parse(value)
          , folderId: this.collection.folderId
        }, 
        {
          success:_.bind(function(event){
            console.log('success saving event');
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
      this.collection = new Folders([], options)
        .on('reset', this.renderCollection, this)
        ;
      this.refresh();
    }
    , refresh: function(){
      console.log(this.name+":refresh");
      /* Clean up and fetch new data. */
      this.$('#folder_list').empty();
      this.selected = null;
      this.collection.fetch();
    }
    , renderCollection: function(col){
      col.each(function(folder){

        /* Recursively display folders. */
        (function recursive(folder, $folder, that){
          var folders = new Folders(folder.get('children'), {
              channelId:  folder.collection.channelId
            , parentId:   folder.get('id') 
            , token:      folder.collection.token
            , baseApiUrl: folder.collection.baseApiUrl
          });
          var folderView = 
            new FolderView({model: folder, collection:folders})
              .on('click', that.click, that )
              .on('edit', that.edit, that )
              .on('delete', that.deleteFolder, that )
              ;
          $folder.append(
            folderView.render().$el
          );
          folders.each(function(subfolder){
            recursive(subfolder, folderView.$('.folder:first'), that);
          });
        })(folder, this.$folderList, this);  

      }, this);
    }
    , click: function(folderView){
      this.$('.folder_container').removeClass('selected');
      folderView.$('.folder_container:first').addClass('selected');
      this.selected = folderView;
      this.trigger('click', folderView.model);
    }
    , saveFolder: function(folder, name){
      console.log(this.name+':saveFolder');
      folder.save({
        name: name
      },
      {
        success:_.bind(function(){
          console.log('success saving folder');
          this.refresh();
          this.modals.edit.close();
        }, this)
      });
    }
    , createFolder: function(name){
      console.log(this.name+':createFolder');
      if (this.selected){
        var parentId = this.selected.model.get('id');
        var col = this.selected.collection;
      } else {
        var parentId = '';
        var col = this.collection;
      } 

      col.create(
        {
            name: name
          , parentId: parentId
        },
        {
          success:_.bind(function(){
            console.log('success creating folder');
            this.refresh();
            this.modals.add.close();
          }, this)
        }
      );
    }
    , deleteFolder: function(folder){
      console.log(this.name+':deleteFolder');
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
    , collection: null
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
      console.log(this.name+':onClick',this.model.get('id'));  
      this.trigger('click', this);
      return false;
    }
    , onEdit: function(){
      console.log(this.name+':onEdit',this.model.get('id'));  
      this.trigger('edit', this.model);
      return false;
    }
    , onDelete: function(){
      console.log(this.name+':onDelete',this.model.get('id'));  
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
      console.log(this.name+':onClick',this.model.get('id'));  
      this.trigger('click');
      return false;
    }
  });

  var TokenSettingsModal = Modal.extend({
    /* Variables */
      templateId: '#token_settings_modal'
    , tokenViewTemplId: '#token_view'
    , tokenViewTempl: null
    , accessesByUsername: null
    , name: 'TokenSettingsModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
      this.tokenViewTempl = _.template($(this.tokenViewTemplId).html());
      this.accessesByUsername = this.options.accessesByUsername;
    } 
    , events: {
        'click #save_btn'   : 'onClickSaveBtn' 
      , 'click #add_btn'    : 'onClickAddBtn'
    }
    , render: function(){
      Modal.prototype.render.call(this);

      this.$tokenList = this.$('#token_list');
      this.$name = this.$('#name');

      _.each(this.accessesByUsername, function(accesses, username){
        accesses.each(function(access){
          this.$tokenList.prepend(
            this.tokenViewTempl({
                username:username
              , id:access.get('token')
              , checked:access.active
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
      console.log(this.name+':onClickSaveBtn');
      var accessesByUsername = this.accessesByUsername;
      this.$('input[type=checkbox]').parents('tr').each(function(){
        var $this = $(this);
        var username = $this.find('.username').text();
        var id = $this.find('.token').text();
        var checked = $this.find('input[type=checkbox]').is(':checked');
        if(!accessesByUsername[username]){
          accessesByUsername[username] = new Accesses([{token:id}], {});
        } else if (!(accessesByUsername[username].where({token:id})).length){
          accessesByUsername[username].add({token:id});
        }
        accessesByUsername[username].where({token:id})[0].active = checked;
      });
      this.trigger('save');
      return false; 
    }
    , onClickAddBtn: function(){
      console.log(this.name+':onClickAddBtn');
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

      /* Beautify value. */
      data.value = JSON.stringify(data.value);
      /* Beautify id. */
      if (data.id.length > 11){
        var length = data.id.length;
        data.id = '...'+data.id.substr(length-8, 8);
      }
      /* Beautify folderId. */
      if (data.folderId !== null && data.folderId.length > 11){
        var length = data.folderId.length;
        data.folderId = '...'+data.folderId.substr(length-8, 8);
      }
      /* Beautify duration if any. */
      if (data.duration === undefined){
        data.duration = 'mark';
      } else if (data.duration === null){
        data.duration = 'running';
      } else {
        data.duration = data.duration.toFixed(2);
      }
      /* Attachments? */
      data.file = (data.attachments && data.attachments.attachment) ?
        data.file = this.model.url()+'/'+data.attachments.attachment.fileName+'?auth='+this.model.collection.token :
        '';

      this.$el.html( this.template( data ) );
      return this;
    }
    , onClickDelete: function(){
      console.log(this.name+':onClickDelete', this.model.get('id'));
      this.trigger('delete', this.model);
      return false;
    }
    , onClickEdit: function(){
      console.log(this.name+':onClickEdit', this.model.get('id'));
      /* Open modal. */
      this.trigger('edit', this.model);
      return false;
    }
  });

  return Backbone.View.extend({
    /* Variables */
      id: '#tab'
    , template: '#tab_view'
    , accessesByUsername: {}
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
            accessesByUsername:this.accessesByUsername
        })
      };
      this.modals.tokenSettings.on('save', this.saveTokenSettings, this);
    }
    , events: {
      'click #settings_btn' : 'onClickSettingsBtn'
    }
    , render: function(){
      console.log(this.name+':render');
      var sessionId = Store.get('sessionId')
        , appToken = Store.get('appToken')
        , username = Store.get('username')
        , baseApiUrl = Store.get('baseApiUrl')
        ;

      if (!sessionId || !appToken || !username || !baseApiUrl){
        return this.trigger('signOut');
      }

      this.model.set({
          sessionId: sessionId
        , appToken: appToken
        , username: username
        , baseApiUrl: baseApiUrl
      });

      var _attach = function(that){
        that.setElement(that.id);
        that.$el.html( that.template()); 
        that.$('#settings_btn').show();
        that.$('#folders').show();
        that.$('#events').show();
      };
      var _renderChannels = function(that){
        /* Rebuild channels. */
        that.views.channels.rebuild( that.accessesByUsername );
      }
      var _processUserAccesses = function(){
        _attach(this);
        /* Manually add the app token to the user accesses. */
        /* Main user app token is active by default. */
        this.accessesByUsername[ username ].unshift(appToken);
        this.accessesByUsername[ username ].at(0).active = true;
        _renderChannels(this);
      };

      if (!this.accessesByUsername[ username ]) {
        this.accessesByUsername[ username ] = 
          new Accesses([], {
              sessionId: sessionId
            , baseApiUrl: baseApiUrl
          });
        this.accessesByUsername[ username ]
          .on('reset', _processUserAccesses, this)
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
      this.views.channels.rebuild( this.accessesByUsername );
    } 
    , updateFoldersAndEvents: function(channel){
      var channelId = channel.get('id');
      this.views.events.rebuild({ 
        channelId: channelId, 
        folderId: null, 
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
      console.log(this.name+':updateEvents');
      var folderId = folder.get('id');
      var options = { 
        channelId: folder.collection.channelId, 
        folderId: folderId, 
        token: folder.collection.token, 
        onlyFolders: [folderId],
        baseApiUrl: folder.collection.baseApiUrl
      };
      this.views.events.rebuild( options );
    }
    , onClickSettingsBtn: function(){
      this.modals.tokenSettings.render();
      return false;
    }
  });

});
