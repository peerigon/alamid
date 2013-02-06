"use strict";

var config = require("../shared/config.js"),
    log = require("../shared/logger.js").get("server"),
    http = require("./transport/http/http.js"),
    websocket = require("./transport/websocket/websocket.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js");

function startServer(port) {

    var server;

    if(port === undefined) {
        port = config.port;
    }

    if(config.use.spdy === true) {
        log.info("SPDY: active");
    }

    //init http/spdy server
    server = http.initServer(port, config.use.spdy);

    if(config.use.websockets === true) {
        //attach socketIO to connect-server
        var io = websocket.initWebsocketConnection(server);
        //attach our beloved sockets
        log.info("Websockets: active");
        handleWebsocket.init(io);
    }

    log.info("alamid-Server running on port " + port);
    return server;
}

module.exports = startServer;