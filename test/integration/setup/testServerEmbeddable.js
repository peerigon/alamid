"use strict";

var _ = require("underscore");

function runTestServer(config) {

    process.env = _.extend(process.env, config);
    var alamid = require("alamid"),
        Server = alamid.Server;

    //start the server
    var server = new Server();
    return server.start();

}

module.exports = runTestServer;