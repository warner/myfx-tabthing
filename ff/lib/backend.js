
const tabs = require("tabs");
const Firebase = require("./firebase-jetpack").Firebase;
var sendToAll = require("./comms").sendToAll;

var counter = 0;
exports.poke = function() {
    console.log("poke");
    counter += 1;
    sendToAll("poke", {pokey: "poked"});
    myTabsWereModified();
    console.log("poked");
};


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

var deviceTabsDB;

function myTabsWereModified() {
    if (shuttingDown)
        return;
    var data = [];
    for each (var tab in tabs)
        data.push({url: tab.url, title: tab.title});
    console.log("calling db.set");
    deviceTabsDB.set(data);
}

var authed;
var allTabs;

exports.controlPageAdded = function() {
    if (authed)
        sendToAll("auth-success", authed);
    if (allTabs)
        sendToAll("tabs", allTabs);
};

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
    if (name == "fb-login") {
        if (authed) {
            console.log("already authed, ignoring");
            return;
        }
        console.log("starting DB");
        var tmpdb = new Firebase("https://warner.firebaseio.com/tabthing");
        console.log("DB connection created");
        tmpdb.auth(data.token, function(success) {
            if (success) {
                authed = data;
                sendToAll("auth-success", data);
                var userTabsDB = tmpdb.child(data.user.id);
                userTabsDB.on("value", function(ss) {
                    allTabs = ss.val();
                    sendToAll("tabs", ss.val());
                    console.log("new fb data", ss.val());
                });
                deviceTabsDB = userTabsDB.child(data.device);
                startWatchingTabs();
            } else {
                sendToAll("auth", "failed");
            }
        });
    }
};
