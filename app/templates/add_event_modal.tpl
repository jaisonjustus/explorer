<div id="add_event_modal" class="modal hide fade">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal">&times;</button>
    <h3>Add Event</h3>
  </div>
  <form id="add_event_form" class="form">
    <div class="modal-body">
      <select id="event_mode">
        <option id="mark">mark event</option>
        <option id="duration">duration event</option>
      </select>
      <label>Description</label>
      <input id="description" class="span4" type="text" placeholder="New event"></input>
      <label>Value</label>
      <input id="value" class="span4" type="text" placeholder="100" value="100"></input>
      <label>Type (JSON)</label>
      <input id="type" class="span4" type="text" placeholder='{"class":"Mass","format":"Kilogram"}' value='{"class":"Mass","format":"Kilogram"}'></input>
    </div>
    <div class="modal-footer">
      <label id="timer" class="duration_btn">0 s.</label>
      <div class="modal_buttons">
        <a id="cancel_btn" class="btn" data-dismiss="modal">Cancel</a>
        <a id="save_btn" class="btn btn-primary mark_btn optional">Save</button>
        <a id="start_btn" class="btn btn-primary duration_btn optional"><i class="icon-play"></i> Start</a>
        <a id="stop_btn" class="btn optional"><i class="icon-stop"></i> Stop & Save</a>
      </div>
    </div>
  </form>
</div> 
