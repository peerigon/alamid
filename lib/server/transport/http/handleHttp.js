"use strict";

var routes = require("../../routes.js"),
    applyMiddleware = require("../../applyMiddleware.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js"),
    onPageRequest = require("./onPageRequest.js"),
    onServiceRequest = require("./onServiceRequest.js"),
    onValidatorRequest = require("./onValidatorRequest.js");

function init(server) {

    //GLOBAL ROUTES
    //really global or just for dynamic requests?
    server.use(function onRequestHandler(req, res, next) {
        applyMiddleware(onRequest, req, res, next);
    });

    //DYNAMIC ROUTES
    //dynamic routes end the request themselves
    server.use(routes.services, function onServiceRequestHandler(req, res, next) {
        applyMiddleware(onServiceRequest, req, res, next);
    });

    server.use(routes.validators, function onValidatorRequestHandler(req, res, next) {
        applyMiddleware(onValidatorRequest, req, res, next);
    });

    /**
     * there will be only one static file server in the future which serves /bundle
     * all files have to be placed there, with the same structure they will be deployed on a static-webserver later
     * all dev-automatics like recompile should not directly handle the request, but update files in the bundle-folder
     */

    //only in dev mode!
    server.use(routes.pages, function onPageRequestHandler(req, res, next) {
        applyMiddleware(onPageRequest, req, res, next);
    });

    //STATIC routes
    //it should be possible to disable static routes
    server.use("/", function onStaticRequestHandler(req, res, next) {
        applyMiddleware(onStaticRequest, req, res, next);
    });

    //this routes applies for every request that hasn't been handled before
    //has to be here also in production-mode because of the index.html
    server.use(function onUnhandledRequestHandler(req, res, next) {
        applyMiddleware(onUnhandledRequest, req, res, next);
    });
}

exports.init = init;