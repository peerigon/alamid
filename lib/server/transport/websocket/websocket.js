"use strict";

//attach socketIO to connect-server
var socketIO = require('socket.io');

//keeps the socket.io instance
var io = null;

function initWebsocketConnection(server) {
    io = socketIO.listen(server);
    io.configure(function(){
      io.set('log level', 1);
    });
    return io;
}

exports.io = io;
exports.initWebsocketConnection = initWebsocketConnection;
exports.getIOInstance = function() {
    return io;
};