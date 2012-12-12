define(['underscore', 'backbone', 'bootstrap'], function(_, Backbone) {
  'use strict';

  return Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , template: null
    , $modal: null
    /* Methods */
    , initialize: function(){} 
    , render: function(){
      this.setElement(this.id);
      this.$el.html(this.template());
      this.$modal = this.$(this.modalId).modal();
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.undelegateEvents();
      if (this.$modal) {
        this.$modal.modal('hide');
      }
    }
  });

});
