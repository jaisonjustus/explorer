define(['underscore', 'backbone', 'bootstrap'], function(_, Backbone) {
  'use strict';

  return Backbone.View.extend({
    /* Variables */
      id: '#modal'
    , template: null
    , $modal: null
    /* Methods */
    , initialize: function(){
      this.template = _.template($(this.templateId).html());
    } 
    , render: function(){
      this.setElement(this.id);
      this.$el.html(this.template());
      this.$modal = this.$(this.templateId).modal();
      this.delegateEvents();
      return this;
    }
    , close: function(){
      this.undelegateEvents();
      this.$modal.modal('hide');
    }
  });

});
