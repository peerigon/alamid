"use strict";

var connect = require("connect"),
    config = require("../core/config"),
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js");

var server = connect();

//give connect some middlewares for the routes
handleHttp.init(server);
//attach our beloved sockets
handleWebsocket.init(server);

server.listen(config.port);