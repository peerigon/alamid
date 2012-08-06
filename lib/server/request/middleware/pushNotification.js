"use strict";

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
        socket.broadcast.to(room).emit(req.getMethod()+"Push", req.getPath(), req.getId(), res.getData());
    }
    next();
}

module.exports = pushNotification;