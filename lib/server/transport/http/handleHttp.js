"use strict";

var router = require("../../router.js");

var config = require("../../../shared/config.js"),
    routes = config.routes;

//handlers for routes
var httpMiddleware = require("./httpMiddleware.js");

/**
 * register dynamic-alamid-routes
 * @param {Object} server
 */
function initRoutes(server, whichRoutes) {

    whichRoutes = whichRoutes || { static : true, dynamic : true };

    var httpRouter = router.get("http")
        //applied on every request
        .add("/*", httpMiddleware.request);

    if (whichRoutes.dynamic) {
        //dynamic routes end the request themselves
        httpRouter
            .add(routes.services + "/*", httpMiddleware.serviceRequest)
            .add(routes.validators + "/*", httpMiddleware.validatorRequest);
    }

    if (whichRoutes.static) {
        httpRouter
            .add(routes.bundle + "*", httpMiddleware.staticRequest)
            .add(routes.bundle + "*", httpMiddleware.unhandledRequest);
    }

    //we always have a error handler for all http-request paths
    httpRouter.on("error", httpMiddleware.requestError);

    server.use(httpRouter.handler);
}

exports.initRoutes = initRoutes;