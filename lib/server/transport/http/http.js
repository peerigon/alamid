"use strict";

var connect = require("connect");
var spdy = require("../spdy/spdy.js");

var app = null;

function initConnect() {

    //only create if not already exists
    if(app === null) {
        app = connect();
    }

    return app;
}

function getConnectInstance() {
    return app;
}

function setConnectInstance(customApp) {
    app = customApp;
}

function initServer(port, useSpdy) {

    var server;

    if(useSpdy) {
        //spdy server
        server = spdy.initServer(app).listen(port);
    }
    else {
        server = app.listen(port);
    }

    //must throw on EADDRINUSE etc.
    server.on("error", function(err) {
        throw err;
    });

    return server;
}

exports.app = app;
exports.initConnect = initConnect;
exports.getConnectInstance = getConnectInstance;
exports.setConnectInstance = setConnectInstance;
exports.initServer = initServer;
