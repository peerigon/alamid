"use strict";

var connect = require("connect");

var app;

function getInstance() {

    if(!app) {
        app = connect();
    }

    return app;
}

function initServer(port) {

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
