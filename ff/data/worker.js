
var db = new Firebase("https://warner.firebaseIO.com/tabthing/");
db.on("value", function(ss) {
    self.postMessage(ss.val());
});
self.port.on("set", function(m) {
    db.set(m);
});

db.set("initial value");
