
var Firebase = require("./firebase-jetpack").Firebase;
var db;

exports.start = function() {
    console.log("starting DB");
    db = new Firebase("https://warner.firebaseio.com/tabthing");
    db.on("value", function(ss) {
        console.log("new fb data", ss.val());
    });
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
    require("./comms").sendToAll("poke", {pokey: "poked"});
    exports.set("new value: "+counter);
    console.log("poked");
};

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
};
