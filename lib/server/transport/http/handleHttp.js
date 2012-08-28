"use strict";

var routes = require("../../routes.js"),
    config = require("../../../shared/config"),
    applyMiddleware = require("../../applyMiddleware.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js"),
    //onPageRequest = require("./onPageRequest.js"),
    onServiceRequest = require("./onServiceRequest.js"),
    onValidatorRequest = require("./onValidatorRequest.js");

/**
 * Handler for errors within middleware-pipeline
 * ends the request and returns error-message depending on mode
 * @param err
 * @param req
 * @param res
 */
function onRequestError(err, req, res) {
    if(err) {
        if(config.isDev) {
            console.log(err.stack);
            res.end(err.toString(), "utf-8");
            return;
        }

        res.statusCode = 500;
        res.end("(alamid) Bad Request", 500);
    }
}
/**
 * register dynamic-alamid-routes
 * @param {Object} server
 */
function initDynamicRoutes(server) {

    //GLOBAL ROUTES
    //might be needed for static and dynamic requests
    server.use(function onRequestHandler(req, res, next) {
        applyMiddleware(onRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });

    //dynamic routes end the request themselves
    server.use(routes.services, function onServiceRequestHandler(req, res, next) {
        applyMiddleware(onServiceRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });

    server.use(routes.validators, function onValidatorRequestHandler(req, res, next) {
        applyMiddleware(onValidatorRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });
}

/**
 * register all static-alamid-routes
 * @param server
 */
function initStaticRoutes(server) {

    /**
     * there will be only one static file server in the future which serves /bundle
     * all files have to be placed there, with the same structure they will be deployed on a static-webserver later
     * all dev-automatics like recompile should not directly handle the request, but update files in the bundle-folder
     */

    /*
    //might be used later to reCompile pages.
    server.use(routes.pages, function onPageRequestHandler(req, res, next) {
        applyMiddleware(onPageRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });
    */

    //it should be possible to disable static routes
    server.use("/", function onStaticRequestHandler(req, res, next) {
        applyMiddleware(onStaticRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });

    //this routes applies for every request that hasn't been handled before
    //has to be here also in production-mode because of the index.html
    server.use(function onUnhandledRequestHandler(req, res, next) {
        applyMiddleware(onUnhandledRequest, req, res, function(err) {
            if(err === null) {
                next();
                return;
            }
            onRequestError(err, req, res);
        });
    });
}

exports.initStaticRoutes = initStaticRoutes;
exports.initDynamicRoutes = initDynamicRoutes;