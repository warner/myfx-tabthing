
/* this file is loaded by the control panel, in a resource: URL, so it runs
 in the usual web-content context. */

var sendToBackend;
var myDeviceInfo;

function msgFromBackend(name, data) {
    console.log("msgFromBackend", name, data);

    if (name == "device-info") {
        $("#my-device-name").text(data.profileID);
        myDeviceInfo = data;
        console.log("set device name");
    }

    if (name == "auth-success") {
        $("#sign-in").hide();
        $("#user").text(data.user.email); // also .id, .hash, .provider
        $("#logged-in").show();
    }

    if (name == "tabs") {
        var ul = $("div#tabs > ul");
        ul.empty();
        var devices = Object.keys(data);
        devices.sort();
        devices.forEach(function(deviceName) {
            var online = data[deviceName].online;
            var dul = $("#templates>.device-entry").clone();
            dul.find("span.device-name").text(deviceName);
            if (deviceName == myDeviceInfo.profileID)
                dul.addClass("my-device");
            if (online)
                dul.addClass("online");
            else
                dul.addClass("offline");
            ul.append(dul);
            var tul = dul.find("ul.device-tabs");
            var tabs = data[deviceName].tabs || [];
            tabs.forEach(function(tab) {
                var title = tab.title || "(no title)";
                var t = $("#templates>.tab-entry").clone();
                t.find("a").attr("href", tab.url).attr("target", "_blank");
                t.find("a").text(title);
                if (tab.faviconURL)
                    t.find("img.tab-favicon").attr("src", tab.faviconURL);
                else
                    t.find("img.tab-favicon").remove();
                tul.append(t);
            });
        });
    }
    console.log("done");
}


function showError(text) {
    $("#error").show().text(text);
}


function doFBPersonaAuth() {
    console.log("about to authClient");
    var db = new Firebase("https://myfx-tabthing.firebaseio.com/");
    console.log("created DB reference");
    var authClient = new FirebaseAuthClient(db, function(error, user) {
        console.log("authClient state changed", error, user);
        console.log(JSON.stringify(user));
        //sendToBackend("fb-login", {token: token, user: user});
    });
    console.log("created authClient 2");
    authClient.login("persona");
}

function doP() {
    function callback(error, token, user) {
        console.log("authClient.login done", error, token, user);
        if (error) showError(error);
        else
            sendToBackend("fb-login", {token: token, user: user});
    }
    function onlogin(assertion) {
        console.log("onlogin", assertion);
        var db = new Firebase("https://myfx-tabthing.firebaseio.com/");
        console.log("created DB reference", db);
        try {
            var authClient = new FirebaseAuthClient(db);
            console.log("created authClient", authClient);
            authClient.jsonp("/auth/persona/authenticate",
                             {"assertion":assertion},
                             function(error, response) {
                                 console.log("jsonp returned", error, response);
                                 if(error || !response["token"]) {
                                     callback(error);
                                 }else {
                                     var token = response["token"];
                                     var user = response["user"];
                                     console.log("calling attemptAuth");
                                     authClient.attemptAuth(token, user, callback);
                                     console.log("called attemptAuth");
                                 }
                             });
            console.log("did authClient.jsonp");
        } catch(e) {
            console.log("error", e);
        }
    }

    navigator.id.watch({"onlogin": onlogin,
                        "onlogout": function(){}
                       });
    navigator.id.request();
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
    // we wait for the page to finish loading *and* the addon's page-mod
    // to finish wiring up its event listener before trying to talk to
    // the addon backend
    function commsReady(e) {
        sendToBackend("page-ready");
    }
    window.addEventListener("comms-ready", commsReady);

    // set up the UI
    $("#error").hide();
    $("#sign-in").show();
    $("#logged-in").hide();
    $("#sign-in").on("click", doFBPersonaAuth);
    //$("#sign-in").on("click", doP);

});
