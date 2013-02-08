/**
 * Backbone View Module to represent and handle file listing for
 * multiple file upload control.
 * @module FileView
 * @author jaisonjustus
 */
define(['jquery', 'underscore', 'backbone',
	'tpl!../templates/fileupload/file_list_template.html',
	'tpl!../templates/fileupload/file_list_partial_template.html'], function($, _, Backbone, fileListTpl, fileListPartTpl)	{

	var FileView = Backbone.View.extend({

		tagName : 'li',

		className : 'file-list-element',

		name : 'FileView',

		/**
		 * File Descriptor represent the vital information about the file like
		 * name, type, size and also have the file object.
		 */
		_fileDescriptor : {},

		template : fileListTpl(),

		partialTemplate : fileListPartTpl,

		initialize : function()	{},

		/**
		 * Event Bindings object for the view
		 */
		events : {
			'click .delete-file' : '_onFileDelete',
			'change .file' : '_onFileAttach'
		},

		/**
		 * Method to render the view
		 * @method render
		 * @access public
		 * @param int mode :represent add/edit mode (1/0).
		 * @param string filename :mandatory during edit event.
		 */
		render : function(mode, filename)	{
			this.$el.html(this.template);
			return this;
		},

		/**
		 * Event handler method to delete file from the attachment selection
		 * @method _onFileDelete
		 * @access private
		 * @param object event
		 */
		_onFileDelete : function(event)	{
			this.trigger('onFileDelete', event);
		},

		/**
		 * Event handler method when file control change is detected. this method 
		 * broadcast the onFileAttach event with the file descriptor. 
		 * @method _addNewFileInput
		 * @access private
		 * @param object event
		 */
		_onFileAttach : function(event)	{
			var fileArray;

			fileArray = event.target.files;
			event.target.disabled = true;

			this._fileDescriptor = this._prepareFileDescriptor(fileArray);
			this.trigger('onFileAttach', this._fileDescriptor);
		},

		/**
		 * Method to prepare the file descriptor. more details on file descriptor
		 * check the fileDescription comment on the top.
		 * Note : for the moment the method doesn't support multiple file 
		 * selection on a single file control.
		 * @method _prepareFileDescriptor
		 * @access private
		 * @param array files
		 * @return object
		 */
		_prepareFileDescriptor : function(files)	{
			return {
				name : files[0].name,
				type : files[0].type,
				size : files[0].size,
				object : files[0]
			}
		},

		/**
		 * Method to render the control with filename instead of file input.
		 * this method is used in edit view. it replaces the file input with
		 * filename because the file input is read-only.
		 * @method renderPartial
		 * @access public
		 * @param object filename
		 */
		renderPartial : function(filename)	{
			this.$el.html(this.partialTemplate({ fullName : filename.full, stripped : filename.stripped }));
			return this;
		}
	});

	return FileView;
});