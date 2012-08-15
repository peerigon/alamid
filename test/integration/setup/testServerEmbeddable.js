"use strict";

function runTestServer(config) {

    process.env.appDir = config.appDir;
    //to be required here after we set the config
    var bootstrap = require("../../../lib/server/bootstrap.server.js");
    return bootstrap();
}

module.exports = runTestServer;