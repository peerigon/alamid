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

    if(useSpdy) {
        //spdy server
        return spdy.initServer(app).listen(port);
    }

    //normal HTTP-server
    return app.listen(port);
}

exports.app = app;
exports.initConnect = initConnect;
exports.getConnectInstance = getConnectInstance;
exports.setConnectInstance = setConnectInstance;
exports.initServer = initServer;
