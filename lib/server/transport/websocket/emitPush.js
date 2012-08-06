"use strict";

var io = require("./websocket.js").io;

function emitPush(roomId, eventName, modelUrl, id, data) {
    io.sockets.in(roomId).emit(eventName, modelUrl, id, data);
}

module.exports = emitPush;

