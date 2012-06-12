"use strict";

var connect = require("connect"),
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js");

function startServer(port) {

    var server = connect();
    //give connect some middlewares for the routes
    handleHttp.init(server);
    //attach our beloved sockets
    handleWebsocket.init(server);

    server.listen(port);
}

module.exports = startServer;



