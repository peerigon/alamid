"use strict";

var Response = require("./Response.class.js"),
    runService = require("./middleware/runService.js"),
    runValidator = require("./middleware/runValidator.js"),
    loadModel = require("./middleware/loadModel.js"),
    pushNotification = require("./middleware/pushNotification.js"),
    sanitizeData = require("./middleware/sanitizeData.js"),
    applyMiddleware = require("../applyMiddleware.js"),
    getMiddleware = require("./middleware.js").getMiddleware,
    log = require("../../shared/logger.js").get("server"),
    _ = require("underscore");

/**
 * handle alamid-requests: services/validators
 * @param {Request} req
 * @param {function(err)} callback
 */
function handleRequest(req, callback) {

    var res = new Response(),
        middlewareStack;

    if(req.getType() === "service") {
        middlewareStack = getMiddleware("services", req.getPath(), req.getMethod());

        if(middlewareStack.length === 0) {
            log.debug("No middleware found for 'services' '" + req.getMethod() + "' '"+ req.getPath() + "'");
        }

        //TODO maybe we optimize here: store stack for every process just once
        middlewareStack.push(sanitizeData); //security check
        middlewareStack.push(loadModel); //loads model
        middlewareStack.push(runService); //addServiceMiddleware
        middlewareStack.push(pushNotification);

        var stackStart = new Date();
        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(nextResult) {
            log.debug("STACK finished Duration " + (new Date() - stackStart) + " ms");

            //check if middleware returned jSend response
            if(nextResult !== null && nextResult instanceof Error === false && typeof nextResult === "object"){
                //set jSend attributes
                if(nextResult.status !== undefined) {
                    res.setStatus(nextResult.status);
                }
                if(nextResult.data !== undefined) {
                    res.setData(nextResult.data);
                }
                if(nextResult.message !== undefined) {
                    res.setErrorMessage(nextResult.message);
                }
            }

            callback(nextResult, req, res);
        });
    }
    else if(req.getType() === "validator" && req.getMethod() === "create") {

        middlewareStack = getMiddleware("validators", req.getMethod(), req.getPath());

        if(middlewareStack.length === 0) {
            log.debug("No middleware found for 'validators' '" + req.getMethod() + "' '"+ req.getPath() + "'");
        }

        middlewareStack.push(sanitizeData); //security check
        middlewareStack.push(runValidator); //addValidatorMiddleware

        applyMiddleware(middlewareStack, req, res, function onAfterMiddlewareExec(nextResult) {
            //check if middleware returned jSend response
            if(nextResult !== null && nextResult instanceof Error === false && typeof nextResult === "object"){
                //set jSend attributes
                if(nextResult.status !== undefined) {
                    res.setStatus(nextResult.status);
                }
                if(nextResult.data !== undefined) {
                    res.setData(nextResult.data);
                }
                if(nextResult.message !== undefined) {
                    res.setErrorMessage(nextResult.message);
                }
            }

            callback(nextResult, req, res);
        });
    }
    else{
        callback(new Error("Invalid Request: " + req.getType()), req, res);
    }
}

module.exports = handleRequest;