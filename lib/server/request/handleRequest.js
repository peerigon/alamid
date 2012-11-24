"use strict";

var Response = require("./Response.class.js"),
    router = require("../router.js"),
    log = require("../../shared/logger.js").get("server"),
    _ = require("underscore");

/**
 * handle alamid-requests: services/validators
 * @param {Request} req
 * @param {function(err)} callback
 */
function handleRequest(req, callback) {

    var dispatch = router.get().handler;

    var res = new Response(),
        path = req.getPath(),
        type = req.getType(),
        method = req.getMethod(),
        transport = req.getTransportType(),
        startTime = new Date();

    var isValidRequest = ( type === "service" ) || (type === "validator" && method === "create");

    //only apply if res in an event-emitter
    if(typeof(res.once) === "function") {
        res.once("end", function(err) {
            res.removeAllListeners();
            callback(err, req, res);
        });
    }

    if(isValidRequest) {

        dispatch(req, res, function(err) {
            log.debug(type.toUpperCase() + " " + method + " /" + path + " " + transport + " " + (new Date() - startTime) + "ms");

            if(err === undefined) {
                err = null;
            }

            res.removeAllListeners();
            callback(err, req, res);
        });

        return;

    }

    //callback with err still needed? could be improved here
    callback(new Error("Invalid Request: " + req.getType()), req, res);
}

module.exports = handleRequest;