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
    io = socketIO.listen(server);

    if(!config.isDev) {
        io.configure(function(){
            io.set('log level', 1);
        });
    }

    return io;
}

exports.io = io;
exports.initWebsocketConnection = initWebsocketConnection;
