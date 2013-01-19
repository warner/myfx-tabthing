const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

require("./comms").setupComms();

widgets.Widget({
  id: "show-tabthing",
  label: "Show Tabs From Other Computers",
  contentURL: data.url("icons/tab-new-6.png"),
  onClick: function() {
    //tabs.open(data.url("main.html"));
      tabs.open("http://myfx-tabthing.lothar.com/main.html");
  }
});

console.log("The add-on is running.");
