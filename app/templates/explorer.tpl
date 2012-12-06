<div class="row">
  <div class="span12 center jumbotron margin_top">  
    <h1 class="pull-left">
      <!-- <img id="logo_channel" src="./images/logo.jpg" width="100px"> -->
      Explorer
    </h1>    
    <div id="menu">
      <button id="signout_btn" class="btn pull-right margin_left_5" title="Sign out">
        <i class="icon-signout"></i> Sign out
      </button>
      <button id="settings_btn" class="btn pull-right margin_left_5" title="Settings">
        <i class="icon-cogs"></i> Explore tokens 
      </button>
      <span class="form-horizontal">
        <label style="display:inline-block">View settings:</label>
        <select id="view_select" class="span2">
          <option>default</option>
          <option>all</option>
          <option>trashed</option>
        </select>
      </span>
    </div>
  </div>
</div>
<hr/>
<div id="view" class="row">
  <div id="channels" class="span6">
    <h2>Channels</h2>
    <div class="well">
      <button id="add_channel_modal_btn" class="btn pull-left" title="Add channel"><i class="icon-plus"></i></button>
      <div class="nano">
        <ul id="channel_list" class="nav nav-list content"></ul>
      </div>
    </div>
  </div>
  <div id="folders" class="span6" style="display:none;">
    <h2 class="inline">Folders</h2>
    <div id="folders" class="well">
      <div style="display:inline-block;width:100%;">
        <button id="add_folder_modal_btn" class="btn pull-left disabled" title="Add folder"><i class="icon-plus"></i></button>
    </div>
      <div class="nano">
        <ul id="folder_list" class="nav nav-list folder margin_top_20 content"></ul>
      </div>
    </div>
  </div>
  <div id="events" class="span12" style="display:none;">
    <h2 class="inline">Events</h2>
    <div class="well">
      <button id="add_event_modal_btn" class="btn pull-left disabled" title="Add event"><i class="icon-plus"></i></button>
      <div class="nano">
        <div class="content">
          <table class="table table-striped" style="display:none;">
            <col style="width:10%">
            <col style="width:15%">
            <col style="width:15%">
            <col style="width:10%">
            <col style="width:10%">
            <col style="width:15%">
            <col style="width:15%">
            <col style="width:10%">
            <thead>
              <tr>
                <th></th>
                <th><a>id</a></th>
                <th><a>folderId</a></th>
                <th><a>duration</a></th>
                <th><a>value</a></th>
                <th><a>type</a></th>
                <th><a>description</a></th>
                <th><a>file</a></th>
              </tr>
            </thead>
            <tbody id="event_list"></tbody> 
          </table>
        </div>
      </div>
    </div>
  </div>
  <div id="modal"></div>
</div>
