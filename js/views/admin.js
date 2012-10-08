(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.AdminView = Backbone.View.extend({
    /* Variables */
      id: '#tab'
    , template: '#tab_view'
    , views: null
    , name:'AdminView'
    /* Methods */
    , initialize: function(){
      showlog(this.name+':initialize');
      this.template = _.template($(this.template).html());
      this.views = {
        channels: new ChannelsView({})
      }
    }
    , render: function(){
      showlog(this.name+':render');
      window.app.sessionId = store.get('sessionId');
      window.app.username = store.get('username');
      window.app.baseApiUrl = store.get('baseApiUrl');
      if (!window.app.sessionId || 
          !window.app.username || 
          !window.app.baseApiUrl){
        this.trigger('signOut');
      } else {
        this.setElement(this.id);
        this.$el.html( this.template() ); 
        this.$('#add_channel_modal_btn').show();
        /* Reset and render channels. */
        this.views.channels.resetCollection(
            window.app.SessionChannels
          , window.app.sessionId 
          , window.app.baseApiUrl
        ).render();
      }
      return this;
    }
  });

  var AddChannelModal = Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , template: '#add_channel_modal'
    , name: 'AddChannelModal'   
    , $modal: null
    , $name: null
    /* Methods */
    , initialize: function(){
      this.template = _.template($(this.template).html());
    } 
    , events: {
      'click #save_btn': 'onClickSaveBtn' 
    }
    , render: function(){
      showlog(this.name+':render'); 
      this.setElement(this.id);
      this.$el.html(this.template());

      this.$modal = this.$('#add_channel_modal').modal();
      this.$name = this.$('#name');

      return this;
    }
    , close: function(){
      this.$modal.modal('hide');
      this.$name.val('');
    }
    , onClickSaveBtn: function(){
      showlog(this.name+':onClickSaveBtn');
      this.trigger('save', this.$name.val());
      return false; 
    }
  });

  var EditChannelModal = Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , template: '#edit_channel_modal'
    , name: 'EditChannelModal'   
    , model: null
    , $modal: null
    , $name: null
    /* Methods */
    , initialize: function(){
      this.template = _.template($(this.template).html());
    } 
    , events: {
      'click #save_btn': 'onClickSaveBtn' 
    }
    , render: function(){
      showlog(this.name+':render'); 
      this.setElement(this.id);
      this.$el.html(this.template());

      this.$modal = this.$('#edit_channel_modal').modal();
      this.$name = this.$('#name');
      this.$name.val(this.model.get('name'));

      return this;
    }
    , close: function(){
      this.$modal.modal('hide');
      this.$name.val('');
    }
    , onClickSaveBtn: function(){
      this.trigger('save', this.model, this.$name.val());
      return false; 
    }
  });

  var ChannelsView = Backbone.View.extend({
    /* Variables */
      id: '#channels'
    , name: 'ChannelsView'
    , addChannelModal: null
    , editChannelModal: null
    , $channelList: null
    /* Methods */
    , initialize: function(){
      this.addChannelModal = new AddChannelModal()
        .on( 'save', _.bind( this.add, this ) ); 
      this.editChannelModal = new EditChannelModal()
        .on( 'save', _.bind( this.save, this ) ); 
    }
    , events : {
      'click #add_channel_modal_btn'  : 'onClickAddModalBtn'
    }
    , render: function(){
      showlog(this.name+':render');
      this.setElement(this.id); 
      this.$channelList = this.$('#channel_list');
    }
    , resetCollection: function(Collection, token, baseApiUrl){
      showlog(this.name+':resetCollection',token,baseApiUrl)
      this.collection = 
        new Collection([], {
          token:token, 
          baseApiUrl: baseApiUrl
        });

      this.collection
        .on('reset', _.bind(this.renderCollection, this) )
        .fetch()
        ;
      return this;
    }
    , add: function(name){
      this.collection.create(
        { name:name },
        { success: _.bind(function(){
          this.collection.fetch();
          this.addChannelModal.close();
        },this)}    
      );
    }
    , save: function(model, name){
      model.save(
        { name:name },
        {
          success:_.bind(function(){
            this.collection.fetch();
            this.editChannelModal.close();
          }, this)
        }    
      );
    
    }
    , renderCollection: function(){
      this.$channelList.empty();
      this.collection.each(function(channel){
        this.$channelList.append(
          new ChannelView({model: channel})
            .on('edit', _.bind(this.onClickEditModalBtn, this))
            .on('delete', _.bind(this.onClickDeleteBtn, this))
            .render().$el
        );
      }, this);
    }
    , onClickAddModalBtn: function(){
      this.addChannelModal.render();
      return false;
    }
    , onClickEditModalBtn: function(channel){
      this.editChannelModal.model = channel;
      this.editChannelModal.render();
      return false;
    }
    , onClickDeleteBtn: function(channel){
      channel.destroy();
      this.renderCollection();
      return false;
    }
  });

  var ChannelView = Backbone.View.extend({
    /* Variables */
      tagName:'li'
    , template: '#channel_view'
    , name: 'ChannelView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
    }
    , events: {
        'click .channel'  : 'onClick'
      , 'click .delete'   : 'onClickDelete'
      , 'click .edit'     : 'onClickEdit'
    }
    , render: function(){
      //showlog('ChannelEntryView:render',this.model.toJSON());
      this.$el.html( this.template( this.model.toJSON() ) );
      this.$el.find('.channel').addClass('pull-right');
      this.$el.find('.delete').show();
      this.$el.find('.edit').show();
      return this;
    }
    , onClick: function(){
      showlog(this.name+':onClick',this.model.get('id'));  
      return false;
    }
    , onClickDelete: function(){
      showlog(this.name+':onClickDelete', this.model.get('id'));
      this.trigger('delete', this.model);
      return false;
    }
    , onClickEdit: function(){
      /* Open modal. */
      this.trigger('edit', this.model);
      return false;
    }
  });
})()
