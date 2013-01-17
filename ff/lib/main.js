const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

require("./comms").setupComms();

widgets.Widget({
  id: "show-tabthing",
  label: "Show Tabs From Other Computers",
  contentURL: data.url("icons/tab-new-6.png"),
  onClick: function() {
    tabs.open(data.url("main.html"));
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

require("tabs").on("ready", function(tab) {
    console.log("tab loaded", tab.title, tab.url);
});

require("tabs").on("close", function(tab) {
    console.log("tab closed", tab);
});


console.log("The add-on is running.");
