"use strict";

var log = require("../../../shared/logger.js").get("server");

/**
 * send push messages to all clients connected to a given room
 * does only work for websocket requests
 * @param req {Object}
 * @param res {Object}
 * @param next {function}
 */
function pushNotification(req, res, next) {

    var room = "",
        session = req.getSession(),
        status = res.getStatus(),
        method = req.getMethod(),
        type = req.getType(),
        socket;

    if(req.getTransportType() !== "websocket") {
        //no websocket transport, skipping push
        next();
        return;
    }

    socket = req.getOriginatedRequest();

    if(session.activeRoomID !==  undefined) {
        room = session.activeRoomID;
    }

    //only emit for success and NOT for read-requests
    if(status === "success" && type === "service" && method !== "read") {

        log.debug("Sending PUSH-Notification to Room '" + room + "' with event 'remote" + method + "'");

        if(method === "create") {
            socket.broadcast.to(room).emit("remoteCreate", req.getPath(), req.getIds(), res.getData());
        }

        if(method === "update") {
            socket.broadcast.to(room).emit("remoteUpdate", req.getPath(), req.getIds(), res.getData());
        }

        if(method === "destroy") {
            socket.broadcast.to(room).emit("remoteDestroy", req.getPath(), req.getIds());
        }
    }
    next();
}

module.exports = pushNotification;