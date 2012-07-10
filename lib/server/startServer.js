"use strict";

var connect = require("connect"),
    session = require("./session.js"),
    handleHttp = require("./transport/http/handleHttp.js"),
    handleWebsocket = require("./transport/websocket/handleWebsocket.js"),
    log = require("../shared/logger.js").get("server");

var socketIO = require('socket.io');

function startServer(port) {

    var app = connect();


    //session support
    app.use(connect.cookieParser('octocat'));
    app.use(connect.session({
        key: 'alamid.sid',
        store : session.Store
    }));



    //registering alamid-routes
    log.debug("registering http-stack");
    handleHttp.init(app);

    //problem related with socket.io and connect 2.x
    //https://github.com/senchalabs/connect/issues/500
    var server = app.listen(port);



    //attach our beloved sockets
    log.debug("registering websockets");
    handleWebsocket.init(server);

    console.log(server);

    log.info("alamid-server running on port " + port);
}

module.exports = startServer;




