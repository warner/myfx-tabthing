const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

function buildDeviceInfo() {
    var s = require("sdk/system");
    var file = require("sdk/io/file");
    var info = {
        user: s.env.USER || s.env.USERNAME,
        app: s.name,
        host: require("./hostname").hostname,
        profileName: require("./profilename").profileName,
        profileDir: file.basename(s.pathFor("ProfD"))
    };
    info.profileID = (info.host+"-"+info.profileDir).replace(/[\.\$\[\]\#\/]/g, "");
    return info;
}
require("./backend").setDeviceInfo(buildDeviceInfo());

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
