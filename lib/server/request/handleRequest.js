"use strict";

var Response = require("./Response.class.js"),
    runService = require("./middleware/runService.js"),
    runValidator = require("./middleware/runValidator.js"),
    loadModel = require("./middleware/loadModel.js"),
    applyMiddleware = require("../applyMiddleware.js"),
    getMiddleware = require("./middleware.js").getMiddleware;

/**
 * handle alamid-requests: services/validators
 * @param req
 * @param callback
 */
function handleRequest(req, callback) {

    var res = new Response(),
        middlewareStack;

    if(req.getType() === "service") {

        middlewareStack = getMiddleware("services", req.getMethod(), req.getPath());
        middlewareStack.push(loadModel); //loads model
        middlewareStack.push(runService); //addServiceMiddleware

        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(err) {
            callback(err, req, res);
        });
    }
    else if(req.getType() === "validator") {

        middlewareStack = [];
        //middlewareStack = getMiddleware("validators", req.getMethod(), req.getPath());
        middlewareStack.push(runValidator); //addValidatorMiddleware

        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(err) {
            callback(err, req, res);
        });
    }
    else{
        callback(new Error("Invalid Request: " + req.getType()), req, res);
    }
}

module.exports = handleRequest;