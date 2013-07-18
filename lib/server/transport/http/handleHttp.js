"use strict";

var router = require("../../router.js"),
    config = require("../../../shared/config.js"),
    routes = config.routes,
    httpMiddleware;

/**
 * register dynamic-alamid-routes
 * @param {Object} server
 */
function initRoutes(server, whichRoutes) {
    var httpRouter;

    // lazy init of middlewares
    httpMiddleware = require("./httpMiddleware.js");
    //needed for dynamic middleware
    //just staticFileHandler at the moment
    httpMiddleware.init();

    whichRoutes = whichRoutes || { static : true, dynamic : true };

    httpRouter = router.get("http")
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