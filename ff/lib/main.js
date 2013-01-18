const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

require("./comms").setupComms();

require("backend").start();

var shuttingDown = false;

function updateAllTabs() {
    if (shuttingDown)
        return;
    var data = [];
    for each (var tab in tabs)
        data.push({url: tab.url, title: tab.title});
    require("./comms").sendToAll("tabs", data);
    require("backend").set(data);
}

require("tabs").on("ready", updateAllTabs);
require("tabs").on("close", updateAllTabs);
updateAllTabs();

widgets.Widget({
  id: "show-tabthing",
  label: "Show Tabs From Other Computers",
  contentURL: data.url("icons/tab-new-6.png"),
  onClick: function() {
    //tabs.open(data.url("main.html"));
      tabs.open("http://myfx-tabthing.lothar.com/main.html");
  }
});

widgets.Widget({
  id: "click",
  label: "poke control panel",
  contentURL: data.url("icons/text-speak.png"),
  onClick: function() {
    require("backend").poke();
  }
});

require("sdk/system/unload").when(function(why) {
    console.log("unload", why);
    shuttingDown = true;
});

console.log("The add-on is running.");
