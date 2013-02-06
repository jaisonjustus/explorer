/**
 * Backbone View Module to represent and handle file listing for
 * multiple file upload control.
 * @module FileView
 * @author jaison@minsh.net
 * @version 0.0.1
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'tpl!../templates/fileupload/file_list_template.html'
],function($, _, Backbone, fileListTpl)	{

	var FileView = Backbone.View.extend({

		tagName : 'li',

		name : 'FileView',

		initialize : function()	{},

		/**
		 * Event Bindings object for the view
		 */
		events : {
			'click .delete-file' : 'deleteFile',
			'change .file' : 'addNewFileInput'
		},

		/**
		 * Method to render the view
		 * @method render
		 */
		render : function()	{
			this.$el.html( fileListTpl() );
			return this;
		},

		/**
		 * Method to delete file from the attachment selection
		 * @method deleteFile
		 */
		deleteFile : function(event)	{
			this.trigger('deleteFile', event);
		},

		/**
		 * Method to add new file controller to input.
		 * @method addNewFileInput
		 */
		addNewFileInput : function(event)	{
			var fileObject = event.target.files;
			event.target.disabled = true;

			this.file = {
				name : fileObject[0].name,
				type : fileObject[0].type,
				size : fileObject[0].size,
				object : fileObject[0]
			}

			this.trigger('attached', this.file);
		}
	});

	return FileView;
});