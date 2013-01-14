"use strict";

var middler = require("middler");

var routes = require("../../routes.js"),
    config = require("../../../shared/config");

//handlers for routes
var httpMiddleware = require("./httpMiddleware.js");

/**
 * register dynamic-alamid-routes
 * @param {Object} server
 */
function initRoutes(whichRoutes, server) {

    whichRoutes = whichRoutes || { static : true, dynamic : true };

    var httpRouter = middler()
        //applied on every request
        .add("/*", httpMiddleware.request);

    if(whichRoutes.dynamic) {
        //dynamic routes end the request themselves
        httpRouter
            .add(routes.services + "/*", httpMiddleware.serviceRequest)
            .add(routes.validators + "/*", httpMiddleware.validatorRequest);
    }

    if(whichRoutes.static) {
        httpRouter
            .add("/*", httpMiddleware.staticRequest)
            .add("/*", httpMiddleware.unhandledRequest)
    }

    //we always have a error handler for all http-request paths
    httpRouter.on("error", httpMiddleware.requestError);

    server.use(httpRouter.handler);
}

exports.initRoutes = initRoutes;