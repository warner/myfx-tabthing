
var Firebase = require("./firebase-jetpack").Firebase;
var db;

var sendToAll = require("./comms").sendToAll;

exports.start = function() {
    console.log("starting DB");
    db = new Firebase("https://warner.firebaseio.com/tabthing");
    console.log("DB connection created");

};

exports.set = function(value) {
    console.log("calling db.set");
    db.set(value);
};

var counter = 0;
exports.poke = function() {
    console.log("poke");
    counter += 1;
    sendToAll("poke", {pokey: "poked"});
    exports.set("new value: "+counter);
    console.log("poked");
};

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
    if (name == "fb-login") {
        db.auth(data.token, function(success) {
            if (success) {
                sendToAll("auth", "success");
                db.on("value", function(ss) {
                    sendToAll("tabs", ss.val());
                    console.log("new fb data", ss.val());
                });
            } else {
                sendToAll("auth", "failed");
            }
        });
    }
};
