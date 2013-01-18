
/* this file is loaded by the control panel, in a resource: URL, so it runs
 in the usual web-content context. */

var sendToBackend;

function msgFromBackend(name, data) {
    console.log("msgFromBackend", name, data);
    if (name == "tabs") {
        var ul = $("div#tabs ul");
        ul.empty();
        var devices = Object.keys(data);
        devices.sort();
        devices.forEach(function(deviceName) {
            var tabs = data[deviceName];
            var dul = $("#templates>.device-entry").clone();
            dul.find("span.device-name").text(deviceName);
            ul.append(dul);
            var tul = dul.find("ul.device-tabs");
            tabs.forEach(function(tab) {
                var title = tab.title || "(no title)";
                var t = $("#templates>.tab-entry").clone();
                t.find("a").attr("href", tab.url);
                t.find("a").text(title);
                tul.append(t);
            });
        });
    }
    if (name == "auth") {
        // ignored
    }
    console.log("done");
}


$(function() {
    console.log("page loaded");
    // we are running in a FF addon
    sendToBackend = function(name, data) {
        /* the addon injects code to catch our "from-content" messages
         and relay them to the backend. It also fires "to-content"
         events on the window when the backend wants to tell us
         something. */
        console.log(["to-backend(JP)", name, data||{}]);
        var e = new CustomEvent("from-content",
                                {detail: {name: name, data: data||{} }});
        window.dispatchEvent(e);
    };
    function backendListener(e) {
        var msg = JSON.parse(e.detail);
        try {
            msgFromBackend(msg.name, msg.data);
        } catch (e) {
            // apparently exceptions raised during event listener
            // functions aren't printed to the error console
            console.log("exception in msgFromBackend");
            console.log(e);
        }
    }
    window.addEventListener("to-content", backendListener);
    window.setTimeout(mainSetup, 0);
});

function showError(text) {
    $("#error").show().text(text);
}

function mainSetup() {
    console.log("mainSetup");
    $("#error").hide();
    $("#sign-in").show();
    $("#logged-in").hide();
    $("#sign-in").on("click", function(e) {
        console.log("about to authClient");
        var db = new Firebase("https://warner.firebaseio.com/tabthing");
        console.log("created DB reference");
        var authClient = new FirebaseAuthClient(db);
        console.log("created authClient");
        authClient.login("persona", function(error, token, user) {
            console.log("authClient.login done", error, token, user);
            if (error) showError(error);
            else {
                $("#sign-in").hide();
                $("#user").text(user.email); // also .id, .hash, .provider
                $("#logged-in").show();
                var device = $("#my-device-name").val();
                sendToBackend("fb-login", {token: token,
                                           user: user,
                                           device: device});
            }
        });
    });
};
