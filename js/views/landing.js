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
      var username  = this.$username.val()
        , password  = this.$password.val()
        , url       = 'http://'+username+'/admin/login'
        ;   

      var xhr = $.post(url, {userName:username, password:password}, 'json')
        .success(_.bind(function(data){ 
          showlog("login success"); 
        }, this));

      window.location.href = e.target.href;
      return false;
    }
  });
})()
