"use strict";

var connect = require("connect");
var app = null;

function initializeHttpServer() {

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

exports.app = app;
exports.initializeHttpServer = initializeHttpServer;
exports.getConnectInstance = getConnectInstance;
exports.setConnectInstance = setConnectInstance;
