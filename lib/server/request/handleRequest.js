"use strict";

var Response = require("./Response.class.js"),
    runService = require("./middleware/runService.js"),
    applyMiddleware = require("../applyMiddleware.js"),
    getMiddleware = require("./middleware.js").getMiddleware;

function handleRequest(req, callback) {

    var res = new Response(),
        middlewareStack;

    if(req.getType() === "service") {

        middlewareStack = getMiddleware("services", req.getMethod(), req.getPath());
        middlewareStack.push(runService); //addServiceMiddleware

        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(err) {
            //pass err back or handle here?
            callback(err, req, res);
        });
    }
    else if(req.getType() === "validator") {

        middlewareStack = getMiddleware("validators", req.getMethod(), req.getPath());
        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(err) {
            //pass err back or handle here?
            callback(err, req, res);
        });
    }
    else{
        callback(new Error("Invalid Request: " + req.getType()));
    }
}

module.exports = handleRequest;