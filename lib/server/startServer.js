"use strict";

var config = require("../shared/config.js");
var log = require("../shared/logger.js").get("server");
var http = require("./transport/http/http.js");
var api = require("alamid-api");
var socketIO = require("socket.io");

function startServer() {

    var router = api.router();

    var app = connect();
    var io;

    //with connect/express app
    api.use(require("alamid-api/plugins/connect"), { app: app });

    if(config.use.websockets === true) {
        //attach socketIO to connect-server
        io = socketIO.listen(app);

        //attach our beloved sockets
        log.info("Websockets: active");
        api.use(require("alamid-api/plugins/socket.io"), { io: io });
    }

    log.info("alamid-Server running on port " + port);

    app.listen(config.port || 9000);

    return router;
}

module.exports = startServer;