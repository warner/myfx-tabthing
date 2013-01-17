
var db = new Firebase("https://warner.firebaseIO.com/tabthing/");
db.on("value", function(ss) {
    var e = new CustomEvent("from-content",
                            {detail: {name: name, data: data||{} }});
    window.dispatchEvent(e);
});
window.addEventListener("to-content", function(e) {
    var msg = JSON.parse(e.detail);
    console.log("from backend", msg);
    db.set(msg);
});

db.set("initial value");
