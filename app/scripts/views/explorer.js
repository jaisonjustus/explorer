define(['underscore', 'backbone', 'store', 'token', 'accesses', 'modal', 'state'], function(_, Backbone, Store, TokenView, Accesses, Modal, state) {
  'use strict';

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
      console.log('init ->',this.options,this);
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

  return Backbone.View.extend({
    /* Variables */
      el: '#view_entry'
    , template: '#explorer_view' 
    , accessesByUsername: {}
    , views: {}
    , modals: {}
    , name: 'ExplorerView'
    /* Methods */
    , initialize: function(){
      this.template = _.template( $(this.template).html() );
      this.views.token = new TokenView({
          model: this.model
        , accessesByUsername: this.accessesByUsername
      });
      this.views.token.on('signOut',_.bind(this.onClickSignOutBtn,this));
      this.modals.tokenSettings = new TokenSettingsModal({
        accessesByUsername: this.accessesByUsername
      });
      this.modals.tokenSettings.on('save', this.saveTokenSettings, this);
    }
    , events: {
        'change #view_select' : 'onChangeViewSelect'
      , 'click #signout_btn'  : 'onClickSignOutBtn' 
      , 'click #settings_btn' : 'onClickSettingsBtn'
    }
    , render: function(){
      console.log(this.name+':render');
      /* Render frame view and activate correct tab. */
      this.$el.html(this.template());
      /* Render sub-view. */
      this.views.token.render();
      return this; 
    }
    , saveTokenSettings: function(){
      this.modals.tokenSettings.close();
      this.views.token.views.channels.rebuild( this.accessesByUsername );
    } 
    , onChangeViewSelect: function(){
      console.log(this.name+':onChangeViewSelect', this.$('#view_select').val());
      state.set('state',this.$('#view_select').val());
    }
    , onClickSignOutBtn: function(e){
      console.log(this.name+':onClickSignoutBtn');
      Store.clear();
      window.location.href = window.location.pathname; 
      return false;
    }
    , onClickSettingsBtn: function(){
      this.modals.tokenSettings.render();
      return false;
    }
  });  

});
