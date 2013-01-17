
//var Firebase = require("./firebase").Firebase;
//var db;
var data = require("self").data;

var worker;

exports.start = function() {
    console.log("starting DB");
    //db = new Firebase("https://warner.firebaseio.com/tabthing");
    //db.on("value", function(ss) {
    //    console.log("new fb data", ss.val());
    //});
    //console.log("DB connection established");

    worker = require("page-worker").Page({
        contentUrl: data.url("worker.html"),
        contentScriptfile: data.url("addon-comms.js")
    });
    worker.on("from-content", function(val) {
        console.log("from db", JSON.stringify(val));
    });
    worker.port.emit("to-content", "early data");

};

exports.set = function(value) {
    worker.port.emit("set", value);
};

exports.poke = function() {
    console.log("poke");
    require("./comms").sendToAll("poke", {pokey: "poked"});
    exports.set("new value");
    console.log("poked");
};

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
};
