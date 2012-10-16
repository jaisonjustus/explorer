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
    , getToken: function(){
      /* Get app token. */
      var url = window.app.baseApiUrl + '/admin/get-my-token';
      var data = {applicationId: 1};
      $.ajaxSetup({
        beforeSend: _.bind(function(xhr){
          xhr.setRequestHeader('Authorization', window.app.sessionId);
        }, this)
      });

      var xhr = $.post(url, data, 'json')
        .success(function(res){ 
          //showlog("success getting token");
          var appToken = new window.app.Token({id:res.id});
          window.app.appToken = appToken;
          //showlog("appToken", appToken);
          store.set('appToken',window.app.appToken);
          window.location.href = './#/token';
        });
    }
    , onClickSigninBtn  : function(e){
      showlog('LandingView:onClickSigninBtn');

      window.app.username = this.$username.val();
      window.app.baseApiUrl = 'https://'+window.app.username+'.rec.la';
      //window.app.baseApiUrl = 'http://localhost:3080/'+window.app.username;
      store.clear();
      store.set('username', window.app.username);
      store.set('baseApiUrl', window.app.baseApiUrl);

      /* Get session ID. */
      var password  = this.$password.val()
        , url       = window.app.baseApiUrl+'/admin/login'
        , data      = {userName:window.app.username,password:password}
        ; 

      var xhr = $.post(url, data, 'json')
        .success(_.bind(function(res){ 
          //showlog("success getting sessID");
          window.app.sessionId = res.sessionID;
          store.set('sessionId',window.app.sessionId);
          this.getToken();
        }, this));

      return false;
    }
  });
})()
