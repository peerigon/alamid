"use strict";

var _ = require("underscore"),
    path = require("path");

function runTestServer(config) {

    process.env = _.extend(process.env, config);

    var initServer = require("./testApp/app/initServer.js");

    return initServer();
}

module.exports = runTestServer;