"use strict";

var _ = require("underscore");

function runTestServer(config) {

    process.env = _.extend(process.env, config);
    var alamid = require("alamid");

    //start the server
    return alamid.startServer();

}

module.exports = runTestServer;