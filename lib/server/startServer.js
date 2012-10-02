"use strict";

var connect = require("connect");

var session = require("./session.js"),
    config = require("../shared/config"),
    log = require("../shared/logger.js").get("server"),
    //server instances
    websocket = require("./transport/websocket/websocket.js"),
    http = require("./transport/http/http.js"),
    //server routes
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js");

function startServer(port) {

    if(port === undefined) {
        port = config.port;
    }

    var app = http.initializeHttpServer();

    //session support
    if(config.useSession === true) {
        log.info("registering session...");
        app.use(connect.cookieParser(session.secret));
        app.use(connect.session({
            secret: session.secret,
            key: session.key,
            store: session.store
        }));
    }

    //registering alamid-routes
    log.debug("registering http-stack...");
    //order is important! dynamic first
    handleHttp.initDynamicRoutes(app);

    if(config.useStaticFileServer === true) {
        log.info("registering static file-server...");
        handleHttp.initStaticRoutes(app);
    }

    //problem related with socket.io and connect 2.x
    //https://github.com/senchalabs/connect/issues/500
    var server = app.listen(port);

    if(config.useWebsockets === true) {
         //attach socketIO to connect-server
         var io = websocket.initWebsocketConnection(server);
        //attach our beloved sockets
        log.info("registering websockets...");
        handleWebsocket.init(io);
    }

    log.info("alamid-server running on port " + port);
    return server;
}

module.exports = startServer;




