
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


exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
    if (name == "fb-login") {
        console.log("starting DB");
        var tmpdb = new Firebase("https://warner.firebaseio.com/tabthing");
        console.log("DB connection created");
        tmpdb.auth(data.token, function(success) {
            if (success) {
                sendToAll("auth", "success");
                var userTabsDB = tmpdb.child(data.user.id);
                userTabsDB.on("value", function(ss) {
                    sendToAll("tabs", ss.val());
                    console.log("new fb data", ss.val());
                });
                deviceTabsDB = userTabsDB.child(data.device);
                require("tabs").on("ready", myTabsWereModified);
                require("tabs").on("close", myTabsWereModified);
                myTabsWereModified();
            } else {
                sendToAll("auth", "failed");
            }
        });
    }
};
