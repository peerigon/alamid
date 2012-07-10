"use strict";

var connect = require("connect"),
    session = require("./session.js"),
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js"),
    log = require("../shared/logger.js").get("server");

function startServer(port) {

    var server = connect();

    //session support
    server.use(connect.cookieParser('octocat'));
    server.use(connect.session({
        key: 'alamid.sid',
        store : session.Store
    }));

    //registering alamid-routes
    log.debug("registering http-stack");
    handleHttp.init(server);

    //attach our beloved sockets
    log.debug("registering websockets");
    handleWebsocket.init(server);

    server.listen(port);
    log.info("alamid-server running on port " + port);
}

module.exports = startServer;




