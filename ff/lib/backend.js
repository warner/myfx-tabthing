
const tabs = require("tabs");
const Firebase = require("./firebase-jetpack").Firebase;
var sendToAll = require("./comms").sendToAll;


var shuttingDown = false;

require("sdk/system/unload").when(function(why) {
    console.log("unload", why);
    shuttingDown = true;
});

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

var deviceTabsDB;

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
    //console.log("calling db.set", data);
    deviceTabsDB.set(data);
}

var storage = require("sdk/simple-storage").storage;
var authed;
var allTabs;

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
    if (name == "page-ready") {
        if (deviceInfo)
            send("device-info", deviceInfo);
        if (authed)
            send("auth-success", authed);
        if (allTabs)
            send("tabs", allTabs);
    }

    if (name == "fb-login") {
        if (authed) {
            console.log("already authed, ignoring");
            return;
        }
        console.log("starting DB");
        var tmpdb = new Firebase("https://myfx-tabthing.firebaseio.com/tabthing");
        console.log("DB connection created");
        tmpdb.auth(data.token, function(error, dummy) {
            if (error) {
                sendToAll("auth", "failed");
                return;
            }
            authed = data;
            sendToAll("auth-success", data);
            // the page-ready message isn't sent on reload, so resend
            // device-info now as a workaround
            sendToAll("device-info", deviceInfo);
            var userTabsDB = tmpdb.child(data.user.id);
            userTabsDB.on("value", function(ss) {
                allTabs = ss.val();
                sendToAll("tabs", ss.val());
                console.log("new fb data", ss.val());
            });
            var deviceDB = userTabsDB.child(deviceInfo.profileID);
            deviceDB.child("online").setOnDisconnect(false);
            deviceDB.child("online").set(true);
            //console.log("setting deviceInfo", JSON.stringify(deviceInfo));
            deviceDB.child("deviceInfo").set(deviceInfo);
            deviceTabsDB = deviceDB.child("tabs");
            startWatchingTabs();
        });
    }
};
