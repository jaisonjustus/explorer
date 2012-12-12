define([
    'jquery'
  , 'underscore'
  , 'backbone'
  , 'store'
  , 'access'
  , 'pryv'
  , 'tpl!../templates/landing.html'
], function(
    $
  , _
  , Backbone
  , Store
  , Access
  , PrYv
  , landingTpl
) {
  'use strict';

  return Backbone.View.extend({
      el: '#view_entry'
    , initialize: function(){} 
    , events : {
      'click #signin_btn' : 'onClickSigninBtn' 
    }
    , render : function(){
      //console.log('LandingView:render');
      var rel = 
        ((window.location.protocol === 'file:') ? 'index.html#' : '#/')
        + 'token'
        , loc = window.location
        , baseUrl = loc.protocol+'//'+loc.host+loc.pathname;
      this.$el.html( landingTpl({ path : baseUrl+rel }) );
      /* Init base url */
      Store.set('baseUrl', baseUrl);
      /* Shortcuts. */
      this.$username  = this.$('#username');
      this.$password  = this.$('#password');
      this.$domain    = this.$('#domain'); 
      return this;
    }
    , getToken: function(href){
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
          window.location.href = href;
        }, this)
      });
    }
    , onClickSigninBtn  : function(e){
      console.log('LandingView:onClickSigninBtn');

      var username = this.$username.val();
      var baseApiUrl = 'https://'+username+'.'+this.$domain.val();

      this.model.set({username:username, baseApiUrl:baseApiUrl});

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
        success: _.bind(function(res){
          if (typeof(res) === 'string'){
            res = JSON.parse(res);
          }

          var sessionId = res.sessionID;
          this.model.set('sessionId', sessionId);
          Store.set('sessionId', sessionId);
          this.getToken(e.target.href);
          
        }, this)
      });

      return false;
    }
  });

});
