"use strict";

//attach socketIO to connect-server
var socketIO = require('socket.io'),
    config = require("../../../shared/config");

//keeps the socket.io instance
var io = null;

/**
 * init a new websocket connection based on socket.io
 * @param server
 * @return {*}
 */
function initWebsocketConnection(server) {

    io = socketIO.listen(server, { log : false});

    if (config.isDev) {
        io.set('log level', 3);
    } else {
        //PRODUCTION
        io.configure(function () {
            io.set('log level', 1);
        });
    }

    //no output in testing mode
    if(config.mode === "testing") {
        io.configure(function(){
            io.set('log level', 0);
        });
    }

    return io;
}

exports.io = io;
exports.initWebsocketConnection = initWebsocketConnection;
