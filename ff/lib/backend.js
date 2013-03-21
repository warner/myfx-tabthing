
const tabs = require("tabs");
var sendToAll = require("./comms").sendToAll;


var shuttingDown = false;

require("sdk/system/unload").when(function(why) {
    console.log("unload", why);
    shuttingDown = true;
});

// CALL startWatchingTabs WHEN YOU ARE ABLE TO PUSH TO THE SERVER
var watchingTabs = false;
function startWatchingTabs() {
    if (watchingTabs)
        return;
    require("tabs").on("ready", myTabsWereModified);
    require("tabs").on("close", myTabsWereModified);
    myTabsWereModified();
}

var deviceInfo;
exports.setDeviceInfo = function(info) {
    console.log("settning deviceInfo", JSON.stringify(info));
    deviceInfo = info;
};

function myTabsWereModified() {
    if (shuttingDown)
        return;
    var data = [];
    for each (var tab in tabs) {
        if (tab.url != "about:blank" && tab.url != "about:newtab")
            data.push({url: tab.url,
                       title: tab.title,
                       faviconURL: tab.favicon
                      });
    }
    // PUSH TO SERVER HERE
    console.log("calling db.set", data);
}

var storage = require("sdk/simple-storage").storage;
var authed;
var allTabs;

// WHEN YOU PULL FROM SERVER, CALL THIS
function dataReceivedFromServer(data) {
    sendToAll("tabs", data);
}

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
    if (name == "page-ready") {
        // THIS MEANS A FRONTEND PAGE IS READY, so send it current data
        if (deviceInfo)
            send("device-info", deviceInfo);
        if (authed)
            send("auth-success", authed);
        if (allTabs)
            send("tabs", allTabs);
    }
};
