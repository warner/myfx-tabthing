
var controlPages = [];

exports.sendToAll = function(name, data) {
    function sendToWorker(worker) {
        worker.port.emit("to-content", {name: name, data: data||{}});
    }
    controlPages.forEach(sendToWorker);
};

const backend = require("./backend");

function addControlPage(worker) {
    controlPages.push(worker);
    console.log("ff-tt control panel (#"+controlPages.length+") opened");
    function send(name, data) {
        //console.log("send", name, data);
        worker.port.emit("to-content", {name: name, data: data||{}});
    }
    worker.port.on("from-content", function (data) {
                       backend.fromContent(send, data.name, data.data);
                       });

    //XXX.sendToAllContent("hello content", {foo: "baz"});

    //worker.port.emit("to-content", {msg: "to-content message body here"});

    worker.on("detach", function() {
                  var index = controlPages.indexOf(worker);
                  if (index != -1)
                      controlPages.splice(index, 1);
                  //console.log("now "+controlPages.length+" workers");
                  });
};

const pagemod = require("page-mod");
const data = require("self").data;
exports.setupComms = function() {
    pagemod.PageMod({ include: data.url("main.html"),
                      contentScriptFile: data.url("addon-comms.js"),
                      contentScriptWhen: "end",
                      onAttach: addControlPage
                    });
};

