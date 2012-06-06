"use strict";

var connect = require("connect"),
    config = require("../core/config"),
    handleRequests = require("./handleRequests.js"),
    handleWebsockets = require("./handleWebsockets.js");

var server = connect();

//give connect some middlewares for the routes
handleRequests.init(server);
//attach our beloved sockets
handleWebsockets.init(server);

server.listen(config.port);