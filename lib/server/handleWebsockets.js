"use strict";

var io = require('socket.io');

function init(server) {

    io.listen(server);
}

exports.init = init;