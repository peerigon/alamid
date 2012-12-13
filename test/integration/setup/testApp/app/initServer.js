"use strict";

function initServer() {

    var alamid = require("alamid"),
        Server = alamid.Server;

    var sessionTest = require("./middleware/sessionTest.js"),
        errorPasser = require("./middleware/errorPasser.js"),
        errorThrower = require("./middleware/errorThrower.js"),
        requestEnder = require("./middleware/requestEnder.js");

    //start the server
    var server = new Server();

    server.addRoute(["create", "update", "read", "destroy"], "/services/session*", sessionTest);


    server.addRoute("read", "/services/errorpasser*", errorPasser);
    server.addRoute("read", "/services/errorthrower*", errorThrower);
    server.addRoute("read", "/services/requestender*", requestEnder);

    server.bootstrap();

    return server.start();

}

module.exports = initServer;