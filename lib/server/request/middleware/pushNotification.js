"use strict";

var log = require("../../../shared/logger.js").get("server");

function pushNotification(req, res, next) {

    var room = "",
        session = req.getSession(),
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

    if(res.getStatus() === "success" && req.getType() === "service") {
        log.debug("Sending PUSH-Notification to Room '" + room + "' for method '" + req.getMethod() + "Push'");
        socket.broadcast.to(room).emit(req.getMethod()+"Push", req.getPath(), req.getId(), res.getData());
    }
    next();
}

module.exports = pushNotification;