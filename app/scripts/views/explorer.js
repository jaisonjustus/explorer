define([
    'jquery'
  , 'underscore'
  , 'backbone'
  , 'store'
  , 'async'
  , 'accesses'
  , 'events'
  , 'folders'
  , 'channels'
  , 'modal'
  , 'state'
  , 'fileview'
  , 'filelistview'
  , 'pryv'
  , 'tpl!../templates/token_settings_modal.html'
  , 'tpl!../templates/add_event_modal.html'
  , 'tpl!../templates/add_channel_modal.html'
  , 'tpl!../templates/edit_channel_modal.html'
  , 'tpl!../templates/explorer.html'
  , 'tpl!../templates/token.html'
  , 'tpl!../templates/folder.html'
  , 'tpl!../templates/edit_folder_modal.html'
  , 'tpl!../templates/add_folder_modal.html'
  , 'tpl!../templates/channel.html'
  , 'tpl!../templates/event.html'
  , 'tpl!../templates/edit_event_modal.html'
  , 'bootstrap'
  , 'jquery.fileupload'
  , 'nanoscroller'
], function(
    $
  , _
  , Backbone
  , Store
  , Async
  , Accesses
  , Events
  , Folders
  , Channels
  , Modal
  , state
  , FileView
  , FileListView
  , PrYv
  , tokenSettingsModalTpl
  , addEventModalTpl
  , addChannelModalTpl
  , editChannelModalTpl
  , explorerTpl
  , tokenTpl
  , folderTpl
  , editFolderModalTpl
  , addFolderModalTpl
  , channelTpl
  , eventTpl
  , editEventModalTpl
) {
  'use strict';

  var ChannelsView = Backbone.View.extend({
    /* Variables */
      id: '#channels'
    , collections: []
    , name: 'ChannelsView'
    , modals: {
        addChannel: null
      , editChannel: null
    }
    , $channelList: null
    /* Methods */
    , initialize: function(){
      this.modals.addChannel = new AddChannelModal()
        .on('save', _.bind(function(name){
          this.add(name);
          this.modals.addChannel.close();
        }, this));
      this.modals.editChannel = new EditChannelModal()
        .on('save', _.bind(this.save, this))
        ;
    }
    , events : {
      'click #add_channel_modal_btn'  : 'onClickAddModalBtn'
    }
    , render: function(){
      this.setElement(this.id); 
      this.$channelList = this.$('#channel_list');
      return this;
    }
    , add: function(name){
      return this.collections[0].create(
        { name:name },
        { success: _.bind(function(){
          this.$channelList.empty();
          _.each(this.collections, function(col){ col.fetch(); });
        },this)} 
      );
    }
    , save: function(model, name){
      console.log('save -> ',model,model.url(),name);
      model.save(
        { name:name },
        {
          success:_.bind(function(){
            this.$channelList.empty();
            _.each(this.collections, function(col){ col.fetch(); });
            this.modals.editChannel.close();
          }, this)
        }    
      );
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
            var col = new Channels([], {
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
        var channelView = new ChannelView({model: channel})
          .on('edit', _.bind(this.onClickEditModalBtn, this))
          .on('delete', _.bind(this.onClickDeleteBtn, this))
          .on('restore', _.bind(this.onClickRestoreBtn, this))
          ;
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
      /* Rebuild page scrollers */
      $('.nano').nanoScroller(); 
    }
    , onClickAddModalBtn: function(){
      this.modals.addChannel.render();
      return false;
    }
    , onClickEditModalBtn: function(channel){
      this.modals.editChannel.model = channel;
      this.modals.editChannel.render();
      return false;
    }
    , onClickDeleteBtn: function(channel){
      channel.destroy()
        .success(_.bind(function(){
          this.$channelList.empty();
          _.each(this.collections, function(col){ col.fetch(); });
        }, this))
        ;
      return false;
    }
    , onClickRestoreBtn: function(channel){
      channel.save({trashed:false})
        .success(_.bind(function(){
          this.$channelList.empty();
          _.each(this.collections, function(col){ col.fetch(); });
        }, this))
        ;
      return false;
    }
  });

  var AddEventModal = Modal.extend({
    /* Variables */
      modalId: '#add_event_modal'
    , mode: 'mark'
    , name: 'AddEventModal'   
    , $name: null

    /** List to save the file descriptor with file object. **/
    , fileList : []

    ,fileListView : ''

    /* Methods */
    , initialize: function(){} 

    , events: {
        'click #save_btn'   : 'onClickSaveBtn' 
      , 'click #start_btn'  : 'onClickStartBtn' 
      , 'click #stop_btn'   : 'onClickStopBtn' 
      , 'change #event_mode': 'onChangeEventMode'
    }
    , render: function(){
      
      this.fileList = [];



      /* Override Modal so that you can't close it. */
      this.setElement(this.id);
      this.$el.html(addEventModalTpl());
      this.$modal = this.$(this.modalId).modal({backdrop:'static'});
      this.delegateEvents();

      this._initFileListView();
      
      /* Shortcuts */
      this.$description = this.$('#description');
      this.$value       = this.$('#value');
      this.$type        = this.$('#type'); 
      return this;
    },

    /**
     * Method to initialize the file list view
     * @method _initFileListView
     * @access private
     */
    _initFileListView : function()  {
      this.fileListView = new FileListView();
      this.fileListView.render();

      this.fileListView
      .on('onNewFileControl', this._saveFileDescriptor, this)
      .on('onFileListDelete', this._removeFileFromList, this);
    },

    /**
     * Method to save the file descriptor to the fileList.
     * @method _saveFileDescriptor
     * @access private
     */
    _saveFileDescriptor : function(fileDescriptor)  {
      this.fileList.push(fileDescriptor);
    },

    /**
     * Method to remove file from the fileList.
     * @method _removeFileFromList
     * @access private
     */
    _removeFileFromList : function(filename)  {
      this.fileList = _.reject(this.fileList, function(file)  {
        return (file.name == filename) ? true : false;  
      });
    },

    /**
     * Method to prepare the FormData object.
     * @method _prepapreFormData
     * @access private
     */
    _prepapreFormData : function()  {
      var formData, i = 0;
      
      formData = new FormData();
      _.each(this.fileList, function(file)  {
        formData.append('attachment-' + i, file.object);
        i++;
      });

      return formData;
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

      var formData;

      formData = this._prepapreFormData();

      this.trigger(
          'save' 
        , this.$description.val()
        , this.$value.val()
        , JSON.parse(this.$type.val())
        , formData
        , this.fileList.length
      );
      return false; 
    }
    , onClickStartBtn: function(){
      this.$('#start_btn').hide();
      this.$('#cancel_btn').hide();
      this.$value.attr('disabled', 'disabled');
      this.$description.attr('disabled', 'disabled');
      this.$('#stop_btn').show();
      this.trigger(
          'start' 
        , this.$description.val()
        , this.$value.val()
        , JSON.parse(this.$type.val())
      );
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
      modalId: '#edit_event_modal'
    , template: editEventModalTpl
    , name: 'EditEventModal'   
    , model: null
    , $name: null

    , fileList : []

    , fileListView : {}

    /** 
     * Form data pointer helps to append the file to formdata object from
     * overlaping with the attached one. This specify the next formdata key
     * identifier (eg : attachment-3, 3 is the key identifier).
     */
    , formDataPointer : 0

    /**
     * Prefix for the FormData key
     */
    , formDataPrefix : "attachment-"

    /* Methods */
    , initialize: function(){
      Modal.prototype.initialize.call(this);
    } 
    , events: {
        'click #save_btn'   : 'onClickSaveBtn'
    }

    , render: function(){
      var filenames = [], attachments;

      this.fileList = [];

      Modal.prototype.render.call(this);
      this.$('#description').val( this.model.get('description') );
      this.$('#value').val( this.model.get('value') );
      this.$('#type').val( JSON.stringify(this.model.get('type')) );

      attachments = this.model.get('attachments');  
      filenames = _.pluck(attachments, 'fileName');

      this.fileListView = new FileListView();
      this.fileListView.renderPartial(filenames);
      this.fileListView.render();

      this.fileListView
      .on('onNewFileControl', this._saveFileDescriptor, this)
      .on('onFileListDelete', this._removeFileFromList, this);
        
      this.formDataPointer = this._setFormDataPointer(attachments);;
      return this;
    },

    /**
     * Method to set the current formDataPointer 
     * @method _setFormDataPointer
     * @param object attachments
     * @access private
     */
    _setFormDataPointer : function(attachments)  {
      var that = this, formDataKeys = [], formDataIndex = [];

      for(var attachment in attachments) {
          formDataKeys.push(attachment);
      }
      
      formDataIndex = _.map(formDataKeys, function(key) { return key.replace(that.formDataPrefix, ''); });
      return _.max(formDataIndex, function(index) { return index; }) + 1;
    },

    /**
     * Method to delete the file from the list. this method is also 
     * responsible for deleting files from the server.
     * @method _removeFileFromList
     * @access private
     * @param string filename
     */
     _removeFileFromList : function(filename) {
        if(this._searchFileList(filename).length > 0) {
          this.fileList = _.reject(this.fileList, function(file)  {
            return (file.name == filename) ? true : false;  
          });
        }else {
          var url = this.model.fileUrl(filename);
          
          $.ajax({
            type : 'DELETE',
            url : url,
            success : function(response)  {
            }
          });

        }
     },

    /**
     * Method to search the fileList for the given filename.
     * @method _searchFileList
     * @access private
     * @param string filename
     * @return array
     */
    _searchFileList : function(filename)  {
      return _.where(this.fileList, {
        name : filename
      });
    },

    /**
     * Method to save the file descriptor to the fileList.
     * @method _saveFileDescriptor
     * @access private
     */
    _saveFileDescriptor : function(fileDescriptor)  {
      this.fileList.push(fileDescriptor);
    },

    /**
     * Method to prepare the FormData object.
     * @method _prepareFormData
     * @access private
     */
    _prepareFormData : function()  {
      var formData = '', that = this, i = this.formDataPointer;

      formData = new FormData();
      _.each(this.fileList, function(file)  {
        formData.append('attachment-' + i, file.object);
        i++;
      });

      return formData;
    }

    , setModel: function(model) {
      this.model = model;
      return this;
    }
    , onClickSaveBtn: function(){
      var formData = this._prepareFormData();

      this.trigger(
          'save'
        , this.model
        , this.$('#description').val()
        , this.$('#value').val()
        , JSON.parse(this.$('#type').val())
        , formData
        , this.fileList.length
      );
      return false; 
    }
  });

  var TokenSettingsModal = Modal.extend({
    /* Variables */
      modalId: '#token_settings_modal'
    , template: tokenSettingsModalTpl
    , accessesByUsername: {} 
    , name: 'TokenSettingsModal'   
    , $name: null
    /* Methods */
    , initialize: function(){
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
            tokenTpl({
                name:access.get('name')
              , username:username
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
        var name = $this.find('.name').text();
        var username = $this.find('.username').text();
        var id = $this.find('.token').text();
        var checked = $this.find('input[type=checkbox]').is(':checked');
        if(!accessesByUsername[username]){
          accessesByUsername[username] = new Accesses([{name: name, token:id}], {});
        } else if (!(accessesByUsername[username].where({token:id})).length){
          accessesByUsername[username].add({name: name, token:id});
        }
        accessesByUsername[username].where({token:id})[0].active = checked;
      });
      this.trigger('save');
      return false; 
    }
    , onClickAddBtn: function(){
      console.log(this.name+':onClickAddBtn');
      this.$tokenList.prepend(
        tokenTpl({
            username:this.$('#from').val()
          , id:this.$('#token').val()
          , checked:true
        })  
      );
      return false; 
    }
  });

  var AddChannelModal = Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , name: 'AddChannelModal'   
    , $modal: null
    , $name: null
    /* Methods */
    , initialize: function(){} 
    , events: {
      'click #save_btn': 'onClickSaveBtn' 
    }
    , render: function(){
      console.log(this.name+':render'); 
      this.setElement(this.id);
      this.$el.html(addChannelModalTpl());
      this.$modal = this.$('#add_channel_modal').modal();
      this.$name = this.$('#name');
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.undelegateEvents();
      this.$modal.modal('hide');
      this.$name.val('');
    }
    , onClickSaveBtn: function(){
      console.log(this.name+':onClickSaveBtn');
      this.trigger('save', this.$name.val());
      return false; 
    }
  });

  var EditChannelModal = Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , name: 'EditChannelModal'   
    , model: null
    , $modal: null
    , $name: null
    /* Methods */
    , initialize: function(){
    } 
    , events: {
      'click #save_btn': 'onClickSaveBtn' 
    }
    , render: function(){
      this.setElement(this.id);
      this.$el.html(editChannelModalTpl());
      this.$modal = this.$('#edit_channel_modal').modal();
      this.$name = this.$('#name');
      this.$name.val(this.model.get('name'));
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.undelegateEvents();
      this.$modal.modal('hide');
      this.$name.val('');
    }
    , onClickSaveBtn: function(){
      this.trigger('save', this.model, this.$name.val());
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

      this.modals.edit.on('save', this.saveEvent, this);
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
      /* Enable add button. */
      $('#add_event_modal_btn').removeClass('disabled');
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
      this.$('table').hide(); 
      this.collection.each(function(event){
        var eventView = 
          new EventView({model: event})
            .on('edit', this.openEditModal, this)
            .on('delete', this.deleteEvent, this)
            ;
        this.$('table').show(); 
        this.$eventList.append( eventView.render().$el );
      }, this);
      /* Rebuild page scrollers */
      $('.nano').nanoScroller(); 
    }
    , openEditModal: function(event){
      console.log(this.name+':openEditModal');
      this.modals.edit.setModel( event ).render();
    }
    , createEvent: function(description, value, type, fileList, listLength){
      this.collection.create(
        {
            description: description
          , value: value
          , type: type 
          , folderId: this.collection.folderId
          , channelId: this.collection.channelId
        },
        {
          success:_.bind(function(event){
            var url, that;

            that = this;
            url = this.collection.baseApiUrl + '/' + this.collection.channelId + '/events/' + event.id + '?auth='+encodeURIComponent(this.collection.token);

            if(listLength > 0)  {
              /** Posting the files to server. **/
              PrYv.postFiles({
                url : url, 
                data : fileList, 
                success : function(response) {
                }
              });
            }

            this.refresh();
            this.modals.add.close();
          }, this)
        }
      );
    }
    , startEvent: function(description, value, type){
      this.collection.create(
        {
            description: description
          , value: value
          , type: type
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
      this.collection.stopCurrentEvent(_.bind(function(data){
          console.log('success stopping event');
          this.refresh();
          this.modals.add.close();
        }, this)
      );
    }
    , saveEvent: function(event, description, value, type, fileList, listLength){
      event.save(
        {
            description:description
          , value:value
          , type:type
          , folderId: this.collection.folderId
        }, 
        {
          success:_.bind(function(event){
            console.log('success saving event', event);

            var url, that;

            that = this;
            url = this.collection.baseApiUrl + '/' + this.collection.channelId + '/events/' + event.id + '?auth='+encodeURIComponent(this.collection.token);

            if(listLength > 0)  {
              /** Posting the files to server. **/
              PrYv.postFiles({
                url : url, 
                data : fileList, 
                success : function(response) {
                }
              });
            }

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
      /* Enable add buttons */
      $('#add_folder_modal_btn').removeClass('disabled').show();
      $('#add_event_modal_btn').removeClass('disabled').show();
      /* Empty collection. */
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
          var folders = new Folders(folder.get('children'), {
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
          $folder.append( folderView.render().$el );
          folders.each(function(subfolder){
            recursive(subfolder, folderView.$('.folder:first'), that);
          });
        })(folder, this.$folderList, this);  

      }, this);

      /* Rebuild page scrollers */
      $('.nano').nanoScroller(); 
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
          , channelId: col.channelId
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
    , collection: null
    , tagName:'li'
    , name: 'FolderView'
    /* Methods */
    , initialize: function(){}
    , events: {
        'click .folder_container' : 'onClick'
      , 'click .edit'             : 'onEdit'
      , 'click .delete'           : 'onDelete'
    }
    , render: function(){
      this.$el.append( folderTpl( this.model.toJSON() ) );
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
      modalId: '#edit_folder_modal'
    , template: editFolderModalTpl
    , name: 'EditFolderModal'   
    , model: null
    , $name: null
    /* Methods */
    , initialize: function(){} 
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
      modalId: '#add_folder_modal'
    , template: addFolderModalTpl
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
    , name: 'ChannelView'
    /* Methods */
    , initialize: function(){}
    , events: {
        'click .channel'  : 'onClick'
      , 'click .delete'   : 'onClickDelete'
      , 'click .edit'     : 'onClickEdit'
      , 'click .restore'  : 'onClickRestore'
    }
    , render: function(){
      this.$el.append( channelTpl( this.model.toJSON() ) );
      this.$el.find('.channel').addClass('pull-right');

      var trash = this.$el.find('#deleter');
      var trashContainer = this.$el.find('.delete');
      trash.removeClass();
      if (this.model.get('trashed') === true){
        trash.addClass('icon-remove-circle');
        trashContainer.attr('title', 'delete');
        this.$el.find('.restore').show().tooltip();
      } else {
        trash.addClass('icon-trash');
        trashContainer.attr('title', 'trash');
        this.$el.find('.restore').hide();
      }
      trashContainer.show().tooltip();
      this.$el.find('.edit').show().tooltip();
      return this;
    }
    , onClick: function(){
      console.log(this.name+':onClick',this.model.get('id'));  
      this.trigger('click');
      return false;
    }
    , onClickDelete: function(){
      console.log(this.name+':onClickDelete', this.model.get('id'));
      this.trigger('delete', this.model);
      return false;
    }
    , onClickRestore: function(){
      console.log(this.name+':onClickRestore', this.model.get('id'));
      this.trigger('restore', this.model);
      return false;
    }
    , onClickEdit: function(){
      /* Open modal. */
      this.trigger('edit', this.model);
      return false;
    }
  });

  var EventView = Backbone.View.extend({
    /* Variables */
      tagName:'tr'
    , model: null
    , name: 'EventView'
    /* Methods */
    , initialize: function(){}
    , events: {
        'click .delete'   : 'onClickDelete'
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){

      /* Stringify JSON object. */
      var data = this.model.toJSON(), tempDateObj;

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

      /* Extracting unix timestamp for table and title */
      tempDateObj = new Date(data.time *1000);
      data.titleTime = "Time(h:m:s) - " + tempDateObj.getHours() + ":" + tempDateObj.getMinutes() + ":" + tempDateObj.getSeconds();
      data.titleTime += "\nTimestamp(s) - " + data.time;
      data.time = tempDateObj.getDate() + "/" + (tempDateObj.getMonth() + 1) + "/" + tempDateObj.getFullYear();

      data.file = [];

      var i = 0;

      /** 
       * Looping throught the attachment list and retriving the first four attachments. 
       * we only show 3 file icons, no more (not enough space).
       */
      for(var attachment in data.attachments) {
        data.file.push(this.model.fileUrl(data.attachments[attachment].fileName));
        if(i > 3) { break; } else { i++; }
      }

      /* Type */
      data.type = JSON.stringify(data.type);

      this.$el.html( eventTpl( data ) );
      /* Add time as tooltip. */
      // this.$el.tooltip({
      //     placement:'bottom'
      //   , title:new Date(data.time*1000)
      // });
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
      el: '#view_entry'
    , accessesByUsername: {}
    , views: null
    , modals: {}
    , name:'ExplorerView'
    /* Methods */
    , initialize: function(){
      this.views = {
          channels: new ChannelsView({})
        , events: new EventsView({})
        , folders: new FoldersView({})
      }
      this.modals.tokenSettings = new TokenSettingsModal();
      this.views.channels.on('click', this.updateFoldersAndEvents, this);
      this.views.folders.on('click', this.updateEvents, this);
      this.modals.tokenSettings.on('save', this.saveTokenSettings, this);
    }
    , events: {
        'change #view_select' : 'onChangeViewSelect'
      , 'click #signout_btn'  : 'onClickSignOutBtn' 
      , 'click #settings_btn' : 'onClickSettingsBtn'
      , 'click #generate_btn' : 'onClickGenerateBtn'
    }
    , render: function(){
      console.log(this.name+':render');
      var sessionId = Store.get('sessionId')
        , appToken = Store.get('appToken')
        , username = Store.get('username')
        , baseApiUrl = Store.get('baseApiUrl')
        ;

      if (!sessionId || !username || !baseApiUrl){
        return this.onClickSignOutBtn();
      }

      var _finalize = function(that){
        /* Save in settings. */
        that.model.set({
            sessionId: sessionId
          , appToken: appToken
          , username: username
          , baseApiUrl: baseApiUrl
        });

        /* Attach to DOM. */
        that.$el.html(explorerTpl());
        that.$('#settings_btn').show();
        that.$('#folders').show();
        that.$('#events').show();
        
        /* Rebuild channels. */
        that.views.channels.rebuild( that.accessesByUsername );
        that.modals.tokenSettings.accessesByUsername = that.accessesByUsername;
      }

      var _processUserAccesses = function(){
        appToken = this.accessesByUsername[username].find(function(access){    
          return (access.get('name') === "pryv-explorer"
               && access.get('type') === "personal");
        });
        if (appToken){
          appToken.active = true;
          Store.set('appToken', appToken);
          _finalize(this);
        } else {
          /* Generate access. */ 
          appToken = this.accessesByUsername[username]
            .on ('sync', _finalize, this)
            .create({
              name: 'pryv-explorer'
            , type: 'personal'
          });
        }
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
        _finalize();
      } 
    
      return this;
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
    , saveTokenSettings: function(){
      this.modals.tokenSettings.close();
      this.views.channels.rebuild( this.accessesByUsername );
    } 
    , onChangeViewSelect: function(){
      console.log(this.name+':onChangeViewSelect', 
                  this.$('#view_select').val());
      state.set('state',this.$('#view_select').val());
      this.views.channels.rebuild( 
          this.accessesByUsername );
    }
    , onClickSignOutBtn: function(e){
      console.log(this.name+':onClickSignoutBtn');
      var baseUrl = Store.get('baseUrl');
      Store.clear();
      /* Keep baseUrl. */
      Store.set('baseUrl', baseUrl);
      window.location.href = baseUrl; 
      return false;
    }
    , onClickSettingsBtn: function(){
      this.modals.tokenSettings.render();
      return false;
    }
    , generateData: function(){
      /* Generate channels. */
      var channelsToCreate = ['diary', 'health', 'position', 'finance'];
      var col = this.views.channels.collections[0];
      var that = this;
      Async.parallel(
        _.map(channelsToCreate, function(id){
          return function(cb){
            /* Check if channel already exists. */
            var existingChannel = col.where({name:id}); 
            if(existingChannel.length){
              that.generateFolders(existingChannel[0], cb);
            } else {
              /* Create channel. */ 
              col.create(
                { name: id }
              , { 
                  success: function(channel){
                    /* Generate folders for the channel. */
                    that.generateFolders(channel, cb)
                  }
                , error: function(model, xhr, options){
                    cb(xhr);
                  }
                }
              );
            }
          }
        })
        , function(err, results){
          that.views.channels.$channelList.empty();
          col.fetch();
        }
      );
    }
    , generateFolders: function(channel, next){
      var foldersToCreate = [1, 2];
      var channelId = channel.get('id');

      this.views.folders.collection = new Folders([],{
        channelId: channelId, 
        parentId: channelId, 
        token: channel.collection.token, 
        baseApiUrl: channel.collection.baseApiUrl
      });
      var that = this;
      Async.parallel(
        _.map(foldersToCreate, function(id){
          return function(cb){
            that.views.folders.collection.create( 
              { name : 'folder_'+id
              , channelId: channelId }, 
              { success: function(folder){
                  that.generateEvents(folder, id, channelId, cb);
                }
              , error: function(model, xhr, options){
                  cb(xhr);
                }
              }
            );
          }
        })
        , function(err, results){
          next();
        }
      );
    }
    , generateEvents: function(folder, folderId, channelId, next){
      
      var today = new Date().getTime();
      var oneYear = 12*30*24*60*60*1000;
      var atEarliest = new Date(today-(oneYear)).getTime();
      /* One hour in seconds for the server. */
      var oneHour = 60*60;

      var eventsToCreate = [];
      var types = [
        {'class': 'mass', format: 'kg'}  
      , {'class': 'money', format: 'chf'}  
      , {'class': 'money', format: 'eur'}  
      , {'class': 'length', format: 'm'}  
      , {'class': 'count', format: 'generic'}  
      , {'class': 'temperature', format: 'c'}  
      ];
      for (var i = 0; i < 10; ++i){
        var index = Math.floor(
          Math.min(types.length-1, Math.random()*(types.length))
        );
        var type = types[index]
        var e = 
        {
          description:'event_'+ folderId + '' + i
          /* choose a random date over the past year,
           * send time in seconds to server. */
        , time: (Math.floor(atEarliest + Math.random()*oneYear))/1000
        , value: Math.floor(Math.random()*100)
        , type: type 
        , channelId: channelId
        }
        if (Math.random() > 0.5){
         e.duration = Math.floor(Math.random()*oneHour);
        }
        if (Math.random() > 0.5){
         e.folderId = folder.get('id');
        }
        eventsToCreate.push(e);
      }
      this.views.events.collection = new Events([],{
        channelId: channelId, 
        parentId: channelId, 
        token: folder.collection.token, 
        baseApiUrl: folder.collection.baseApiUrl
      });
      var that = this;
      Async.parallel(
        _.map(eventsToCreate, function(eventData){
          return function(cb){
            that.views.events.collection.create( 
              eventData, 
              { success: function(event){
                  cb(null, event);
                }
              , error: function(model, xhr, options){
                  cb(xhr);
                }
              }
            );
          }
        })
        , function(err, results){
          next();
        }
      );
    }
    , onClickGenerateBtn: function(){
      this.generateData();
    }
  });
});
