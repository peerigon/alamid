"use strict";

require("nodeclass").registerExtension();
var path = require("path");

function runTestServer(config, callback) {

    process.env.appDir = config.appDir;

    var bootstrap = require("./bootstrapTestServer"),
        startServer = require("../../../lib/server/startServer.js");

    bootstrap();
    return startServer(9090);
}

module.exports = runTestServer;