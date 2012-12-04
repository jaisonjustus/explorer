define(['underscore'], function(_) {
  'use strict';

  return {
    /*
     *
     */
    post:function(pack){
      pack.data = pack.data || {};
      var client = new XMLHttpRequest();
      client.open('POST', pack.url);
      client.onreadystatechange = function() {
        if (client.readyState == 4) {
          pack.success(JSON.parse(client.responseText));
        }
      };
      client.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      client.send(JSON.stringify(pack.data));
    }
  };

});
