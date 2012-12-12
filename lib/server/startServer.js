"use strict";

var connect = require("connect"),
    path = require("path");

var session = require("./session.js"),
    config = require("../shared/config"),
    log = require("../shared/logger.js").get("server"),
//transport instances
    http = require("./transport/http/http.js"),
    websocket = require("./transport/websocket/websocket.js"),
//transport routes
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js");

/**
 * start the server as defined in config or via server-class
 * @param port
 * @return {*}
 */
function startServer(port) {

    if(port === undefined) {
        port = config.port;
    }

    var app = http.initConnect(),
        whichRoutes = {
            dynamic : true,
            static : false
        };

    //session support
    if(config.useSession === true) {

        var sess = session.get();

        //load default config
        if(sess === null) {
            log.warn("No Session defined. Using Default-Session instead.");
            sess = require("../core/defaults/defaultSession.js");
            session.set(sess);
        }

        app.use(connect.cookieParser(sess.secret));
        app.use(connect.session({
            secret: sess.secret,
            key: sess.key,
            store: sess.store
        }));
    }

    //registering alamid-routes
    if(config.useStaticFileServer === true) {
        log.info("Static-File-Server: active");
        whichRoutes.static = true;
    }

    handleHttp.initRoutes(whichRoutes, app);

    //init http/spdy server
    var server = http.initServer(port);

    if(config.useWebsockets === true) {

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




