(function(){
  /* Namespace. */
  window.app = window.app || {};

  window.app.LandingView = Backbone.View.extend({
    el: '#view_entry'
    , initialize: function(){
      showlog('LandingView:initialize');
      this.template = _.template( $('#landing_view_template').html() );
    } 
    , events : {
      'click #signin_btn' : 'onClickSigninBtn' 
    }
    , render : function(){
      showlog('LandingView:render');
      this.$el.html( this.template() );

      this.$username = this.$('#username');
      this.$password = this.$('#password');

      return this;
    }
    , onClickSigninBtn  : function(e){
      showlog('LandingView:onClickSigninBtn');

      window.app.username = this.$username.val();
      //window.app.baseUrl = 'http://'+window.app.username+'.rec.la';
      window.app.baseUrl = 'http://localhost:3080/'+window.app.username;

      var password  = this.$password.val()
        , url       = window.app.baseUrl+'/admin/login'
        , data      = {userName:window.app.username,password:password}
        ; 

      showlog("cookies",document.cookie);
      var xhr = $.post(url, data, 'json')
        .success(_.bind(function(res){ 
          showlog("login success",xhr.getAllResponseHeaders()); 
          window.location.href = e.target.href;
        }, this));
    
      return false;
    }
  });
})()
