"use strict";

var config = require("../shared/config.js");
var log = require("../shared/logger.js").get("server");
var api = require("alamid-api");
var socketIO = require("socket.io");
var http = require("http");
var init = require("./init");

var defaultHttpServer = require("./defaultHttp");

function alamid(httpApp, ioApp) {

    httpApp = httpApp || defaultHttpServer();

    var httpServer = http.createServer(httpApp);
    var hybrid = api.router();

    api.use(require("alamid-api/plugins/enhancedResponse"));

    log.info("HTTP: active");
    api.use(require("alamid-api/plugins/connect"), {app: httpApp});

    if (config.use.websockets === true) {
        //attach socketIO to connect-server
        ioApp = ioApp || socketIO.listen(httpServer);

        //attach our beloved sockets
        log.info("WebSockets: active");
        api.use(require("alamid-api/plugins/socket.io"), {io: ioApp, session: httpApp.session });
    }

    init.hybrid(hybrid);

    return {
        http: httpApp,
        io: ioApp,
        listen: httpServer.listen.bind(httpServer),
        hybrid: hybrid
    };
}

module.exports = alamid;