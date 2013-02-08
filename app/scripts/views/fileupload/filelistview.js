/**
 * Module to handle the file list rendering and events regarding 
 * the views
 * @module FileListView
 * @author jaisonjustus
 */
define(['jquery', 'underscore', 'backbone', 'fileview'], function($, _, Backbone, FileView)	{

	var FileListView = Backbone.View.extend({

		/** Defining view boundry. **/
		el : '#attach-file-list',

		/**
		 * Initialize Method.
		 */
		initialize : function()	{},

		/**
		 * Method to render the file list.
		 * @method render
		 * @access public
		 * @return object
		 */
		render : function()	{
			this._addFileControl();
			return this;
		},

		/**
		 * Method to add new file control to the dom.
		 * @method _addFileControl
		 * @access private
		 */
		_addFileControl : function()	{
			var fileView = new FileView();
			this.$el.append(fileView.render().$el);

			fileView
			.on('onFileDelete', this._onFileDelete, this)
			.on('onFileAttach', this._onFileAttach, this);
		},

		/**
		 * Method to handle onFileDelete event get triggered. the method will
		 * remove the particular file control dom element which triggered the event.
		 * This method trigger and event when its completed removing the dom.
		 * @method _onFileDelete
		 * @access private
		 * @param object eventObj 
		 */
		_onFileDelete : function(eventObj)	{
			var deleteImage = this.$(event.target),
				fileListElement = deleteImage.parent(),
				fileHolder = deleteImage.parent().children('.file'),
				filename = (fileHolder.prop('tagName') == 'INPUT') ? fileHolder.val().split('\\').pop() : fileHolder.attr("data-pryv-filename");

		    if(fileListElement.parent().children().length > 1 && filename !== "")  {
		        this.$el.find(fileListElement).remove();
		    }

			this.trigger('onFileListDelete', filename);
		},

		/**
		 * Method to handle onFileAttach event get triggered. this method will add new
		 * file control to the dom when the event get trigged. this method is also
		 * responsible for triggering onFileControlAdd, propagates the event with 
		 * file descriptor.
		 * @method _onFileAttach
		 * @access private
		 * @param object fileDescriptor
		 */
		_onFileAttach : function(fileDescriptor)	{
			this._addFileControl();
			this.trigger('onNewFileControl', fileDescriptor);
		},

		/**
		 * Method to render the list partialy for already attached events.
		 * @method renderPartial
		 * @access public
		 * @param array filenames
		 */
		renderPartial : function(filenames)	{
			var that = this;
			_.each(filenames, function(file)	{
				var fileView = new FileView();
				strippedName = file.substring(0,15) + '...' + file.substring(file.length-3, file.length);
				that.$el.append(fileView.renderPartial({ stripped : strippedName, full : file }).$el);

				fileView
				.on('onFileDelete', that._onFileDelete, that)
				.on('onFileAttach', that._onFileAttach, that);
			});
		}

	});

	return FileListView;
})