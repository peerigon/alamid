"use strict";

var middler = require("middler");

var routes = require("../../routes.js"),
    config = require("../../../shared/config");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js"),
    onServiceRequest = require("./onServiceRequest.js"),
    onValidatorRequest = require("./onValidatorRequest.js"),
    applyMiddleware = require("../../applyMiddleware.js"),
    onRequestError = require("./onRequestError.js");

/**
 * register dynamic-alamid-routes
 * @param {Object} server
 */
function initRoutes(whichRoutes, server) {

    whichRoutes = whichRoutes || { static : true, dynamic : true };

    var httpRequestHandler = middler()
        //applied on every request
        .add("/*", onRequest);

    if(whichRoutes.dynamic) {
        //dynamic routes end the request themselves
        httpRequestHandler
            .add(routes.services + "/*", onServiceRequest)
            .add(routes.validators + "/*", onValidatorRequest);
    }

    if(whichRoutes.static) {
        httpRequestHandler
            .add("/*", onStaticRequest)
            .add("/*", onUnhandledRequest)
            .on("error", onRequestError);
    }

    server.use(httpRequestHandler.handler);
}

exports.initRoutes = initRoutes;