"use strict";

//attach socketIO to connect-server
var socketIO = require('socket.io'),
    config = require("../../../shared/config");

//keeps the socket.io instance
var io = null,
    ioOptions = {
        "log level" : 1
    };

/**
 * init a new websocket connection based on socket.io
 * @param server
 * @return {*}
 */
function initWebsocketConnection(server) {

    io = socketIO.listen(server, ioOptions);
    return io;
}

function setSocketIOOptions(options) {
    ioOptions = options;
}

function getInstance() {
    return io;
}

exports.getInstance = getInstance;
exports.io = io;
exports.initWebsocketConnection = initWebsocketConnection;
exports.setSocketIOOptions = setSocketIOOptions;

