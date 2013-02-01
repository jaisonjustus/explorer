define([
    'jquery'
  , 'underscore'
  , 'backbone'
  , 'store'
  , 'pryv'
  , 'tpl!../templates/landing.html'
], function(
    $
  , _
  , Backbone
  , Store
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
        + 'explorer'
        , loc = window.location
        , baseUrl = loc.protocol+'//'+loc.host+loc.pathname;
      this.$el.html( landingTpl({ path : baseUrl+rel }) );
      /* Init base url */
      Store.set('baseUrl', baseUrl);
      /* Shortcuts. */
      this.$username  = this.$('#username');
      this.$password  = this.$('#password');
      this.$domain    = this.$('#domain'); 
      this.$mode      = this.$('#mode');
      return this;
    }
    , onClickSigninBtn  : function(e){
      console.log('LandingView:onClickSigninBtn');

      var username = this.$username.val();
      var baseApiUrl = 'https://'+username+'.'+this.$domain.val();
      var mode = this.$mode.find(':selected').attr('id');

      this.model.set({username:username, baseApiUrl:baseApiUrl});

      Store.set('username', username);
      Store.set('baseApiUrl', baseApiUrl);

      if (mode === 'trusted'){
        /* Get session ID. */
        var password  = this.$password.val()
          , url       = baseApiUrl+'/admin/login'
          , data      = {
            username:username
              , password:password
              , appId: 'pryv-explorer'
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
            window.location.href = e.target.href;
          }, this)
        });
      } else {
        console.log( "Standard mode not implemented yet." );
      }

      return false;
    }
  });
});
