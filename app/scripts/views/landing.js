define(['jquery', 'underscore', 'backbone', 'store', 'access', 'pryv'], function($, _, Backbone, Store, Access, PrYv) {
  'use strict';

  return Backbone.View.extend({
      el: '#view_entry'
    , initialize: function(){
      //console.log('LandingView:initialize');
      this.template = _.template( $('#landing_view_template').html() );
    } 
    , events : {
      'click #signin_btn' : 'onClickSigninBtn' 
    }
    , render : function(){
      //console.log('LandingView:render');
      this.$el.html( this.template() );
      /* Shortcuts. */
      this.$username  = this.$('#username');
      this.$password  = this.$('#password');
      this.$domain    = this.$('#domain'); 
      return this;
    }
    , getToken: function(){
      /* Get app token. */
      var sessionId = this.model.get('sessionId');

      var url = this.model.get('baseApiUrl') + '/admin/get-app-token?auth='+encodeURIComponent(sessionId);

      PrYv.post({
        url: url, 
        success: _.bind(function(res){
          if (typeof(res) === 'string'){
            res = JSON.parse(res);
          }
          var appToken = new Access({token:res.token});
          this.model.set('appToken', appToken);
          Store.set('appToken', appToken);
          window.location.href = './#/token';
        }, this)
      });
    }
    , onClickSigninBtn  : function(e){
      console.log('LandingView:onClickSigninBtn');

      var username = this.$username.val();
      var baseApiUrl = 'https://'+username+'.'+this.$domain.val();

      this.model.set({username:username, baseApiUrl:baseApiUrl});

      Store.clear();
      Store.set('username', username);
      Store.set('baseApiUrl', baseApiUrl);

      /* Get session ID. */
      var password  = this.$password.val()
        , url       = baseApiUrl+'/admin/login'
        , data      = {
            username:username
          , password:password
          , appId: 'explorer'
        }
      ; 

      PrYv.post({
        url: url, 
        data:data, 
        success: _.bind(function(res){
          if (typeof(res) === 'string'){
            res = JSON.parse(res);
          }

          var sessionId = res.sessionID;
          this.model.set('sessionId', sessionId);
          Store.set('sessionId', sessionId);
          this.getToken();
          
        }, this)
      });

      return false;
    }
  });

});
