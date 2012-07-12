"use strict";

require("nodeclass").registerExtension();

//we bootstrap the test-server
var startServer = require("../../../lib/server/startServer.js"),
    bootstrap = require("./bootstrapTestServer");

bootstrap();
startServer(9090);

//this line is needed for mocha to know the server is up and running
console.log("TEST-SERVER listening on 9090");
