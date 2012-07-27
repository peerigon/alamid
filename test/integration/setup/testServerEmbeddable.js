"use strict";

require("nodeclass").registerExtension();

function runTestServer(config) {

    process.env.appDir = config.appDir;

    var bootstrap = require("./bootstrapTestServer"),
        startServer = require("../../../lib/server/startServer.js");

    bootstrap();
    return startServer(9090);
}

module.exports = runTestServer;