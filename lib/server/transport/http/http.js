"use strict";

var connect = require("connect");
var app = null;

function initializeHttpServer() {
    app = connect();
    return app;
}

exports.app = app;
exports.initializeHttpServer = initializeHttpServer;
