"use strict";

require("nodeclass").registerExtension();

//a simple helper-app to run a stripped down connect-server with all alamid-defined-routes
var connect = require("connect"),
    handleHttp = require("../../../lib/server/transport/http/handleHttp.js");

var server = connect();
handleHttp.init(server);

console.log("TEST-SERVER listening on 9090");
server.listen(9090);