"use strict";

var connect = require("connect");

var session = require("./session.js"),
    config = require("../shared/config"),
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js"),
    log = require("../shared/logger.js").get("server");

var socketIO = require('socket.io');

function startServer(port) {

    var app = connect();

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
        //attach our beloved sockets
        log.info("registering websockets...");
        handleWebsocket.init(server);
    }

    log.info("alamid-server running on port " + port);
    return app;
}

module.exports = startServer;




