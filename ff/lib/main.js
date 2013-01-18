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
      tabs.open("http://localhost:8078/main.html");
  }
});

var {startServerAsync} = require("sdk/test/httpd");
// files that are served to the frontend panel
var server = startServerAsync(8078);
function serveFile(req, resp) {
    var contents = data.load(req.path.slice(1));
    if (contents.length)
        resp.write(contents); // writing empty string is an error
}
var staticFiles = ["firebase.js", "jquery-1.9.0.js", "main.html", "main.js",
                   "css/main.css"];
for each (var f in staticFiles) {
    server.registerPathHandler("/"+f, serveFile);
};

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
