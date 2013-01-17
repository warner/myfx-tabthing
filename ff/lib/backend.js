
exports.poke = function() {
    console.log("poke");
    require("./comms").sendToAll("poke", {pokey: "poked"});
    console.log("poked");
};

exports.fromContent = function(send, name, data) {
    console.log("fromContent", name, data);
};
