"use strict";

var connect = require("connect"),
    routes = require("../../routes.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js"),
    applyMiddleware = require("../../applyMiddleware.js"),
    serveBootstrapJS = require("./middleware/serveBootstrapJS.js"),
//onPageRequest = require("./onPageRequest.js");
    onServiceRequest = require("./onServiceRequest.js");
//onValidatorRequest = require("./onValidatorRequest.js"),


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
    //server.use(routes.validators, onValidatorRequest);

    //STATIC routes
    server.use(routes.statics, function onStaticRequestHandler(req, res, next) {
        applyMiddleware(onStaticRequest, req, res, next);
    });

    //server.use(routes.pages, onPageRequest);
    server.use(routes.bootstrapJS, serveBootstrapJS);

    //this routes applies for every request that hasn't been handled before
    server.use(function onUnhandledRequestHandler(req, res, next) {
        applyMiddleware(onUnhandledRequest, req, res, next);
    });


    /*
     server.use(routes.pages, function onPageRequestHandler(req, res, next) {
     applyMiddleware(onPageRequest, req, res, next);
     });
     */

}

exports.init = init;