"use strict";

var Response = require("./Response.class.js"),
    router = require("../router.js"),
    log = require("../../shared/logger.js").get("server"),
    config = require("../../shared/config");

/**
 * handle alamid-requests: services/validators
 * @param {Request} req
 * @param {function(err)} callback
 */
function handleRequest(req, callback) {

    var routerInstance = router.get("alamid");
    var dispatch = routerInstance.handler;

    var res = new Response(),
        method = req.getMethod(),
        transport = req.getTransportType(),
        startTime = new Date();

    //only apply if res in an event-emitter
    if(typeof(res.once) === "function") {
        //gets triggered by res.end()
        res.once("end", function(err) {
            res.removeAllListeners();
            callback(err, req, res);
        });
    }

    log.debug(method.toUpperCase() + " " + req.getRawPath() + " (" + transport + ")");

    dispatch(req, res, function(err) {

        //additional line need because middle passes the error to this callback
        //we want to handle errors globally on the error-event.. so let's emit it.
        //look at https://github.com/carlos8f/node-middler/issues/7
        if(err) {
            routerInstance.emit("error", err, req, res);
            return;
        }

        log.info(method.toUpperCase() + " " + req.getRawPath() + " " + " (" + transport + ") " + res.getStatusCode() + " " + res.getStatus().toUpperCase() + " - " + (new Date() - startTime) + "ms");

        if(err === undefined) {
            err = null;
        }

        //Errors in the middleware pipeline are handled by the router
        //look at attachAlamidMiddleware.js
        //if no error was passed, we assume everything went well and pass back to the adapter
        res.end();
    });
}

module.exports = handleRequest;