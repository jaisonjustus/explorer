define(['jquery', 'underscore', 'backbone', 'store', 'session_channels'], function($, _, Backbone, Store, SessionChannels) {
  'use strict';

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
      //console.log('ChannelEntryView:render',this.model.toJSON());
      this.$el.html( this.template( this.model.toJSON() ) );
      this.$el.find('.channel').addClass('pull-right');
      this.$el.find('.delete').show();
      this.$el.find('.edit').show();
      return this;
    }
    , onClick: function(){
      console.log(this.name+':onClick',this.model.get('id'));  
      return false;
    }
    , onClickDelete: function(){
      console.log(this.name+':onClickDelete', this.model.get('id'));
      this.trigger('delete', this.model);
      return false;
    }
    , onClickEdit: function(){
      /* Open modal. */
      this.trigger('edit', this.model);
      return false;
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
      console.log(this.name+':render'); 
      this.setElement(this.id);
      this.$el.html(this.template());
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
      console.log(this.name+':render'); 
      this.setElement(this.id);
      this.$el.html(this.template());
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
      console.log(this.name+':render');
      this.setElement(this.id); 
      this.$channelList = this.$('#channel_list');
    }
    , resetCollection: function(Collection, token, baseApiUrl){
      console.log(this.name+':resetCollection',token,baseApiUrl)
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

  return Backbone.View.extend({
    /* Variables */
      id: '#tab'
    , template: '#tab_view'
    , views: null
    , name:'AdminView'
    /* Methods */
    , initialize: function(){
      console.log(this.name+':initialize');
      this.template = _.template($(this.template).html());
      this.views = {
        channels: new ChannelsView({})
      }
    }
    , render: function(){
      console.log(this.name+':render');
      var sessionId   = Store.get('sessionId')
        , username    = Store.get('username')
        , baseApiUrl  = Store.get('baseApiUrl')
        ;
      if (!sessionId || !username || !baseApiUrl){
        this.trigger('signOut');
      } else {
        this.setElement(this.id);
        this.$el.html( this.template() ); 
        this.$('#add_channel_modal_btn').removeClass('disabled').show();
        /* Reset and render channels. */
        this.views.channels.resetCollection(
            SessionChannels
          , sessionId 
          , baseApiUrl
        ).render();
      }
      return this;
    }
  });

});
