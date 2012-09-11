(function(){
  "use strict"
  /* Namespace. */
  window.app = window.app || {};

  window.app.LandingView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      //showlog('LandingView:initialize');
      this.template = _.template( $('#landing_view_template').html() );
    } 
    , events : {
      'click #signin_btn' : 'onClickSigninBtn' 
    }
    , render : function(){
      //showlog('LandingView:render');
      this.$el.html( this.template() );
      /* Shortcuts. */
      this.$username = this.$('#username');
      this.$password = this.$('#password');
      return this;
    }
    , onClickSigninBtn  : function(e){
      showlog('LandingView:onClickSigninBtn');

      window.app.username = this.$username.val();
      //window.app.baseApiUrl = 'http://'+window.app.username+'.rec.la';
      window.app.baseApiUrl = 'http://localhost:3080/'+window.app.username;

      store.set('username', window.app.username);
      store.set('baseApiUrl', window.app.baseApiUrl);

      var password  = this.$password.val()
        , url       = window.app.baseApiUrl+'/admin/login'
        , data      = {userName:window.app.username,password:password}
        ; 

      var xhr = $.post(url, data, 'json')
        .success(function(res){ 
          window.app.sessionID = res.sessionID;
          store.set('sessionID',window.app.sessionID);
          window.location.href = e.target.href;
        });
    
      return false;
    }
  });
})()
