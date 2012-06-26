"use strict";

var connect = require("connect"),
    routes = require("../../routes.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js"),
    applyMiddleware = require("../../applyMiddleware.js"),
    serveInitJS = require("./middleware/serveInitJS.js"),
    //onPageRequest = require("./onPageRequest.js");
    onServiceRequest = require("./onServiceRequest.js");
    //onValidatorRequest = require("./onValidatorRequest.js"),


function init(server) {

    //every request has this handler
    server.use(function onRequestHandler(req, res, next) {
        applyMiddleware(onRequest, req, res, next);
    });

    server.use(routes.statics, function onStaticRequestHandler(req, res, next) {
        applyMiddleware(onStaticRequest, req, res, next);
    });

    /*
    server.use(routes.pages, function onPageRequestHandler(req, res, next) {
       applyMiddleware(onPageRequest, req, res, next);
    });
    */


    //dynamic routes
    server.use(routes.services, function onServiceRequestHandler(req, res, next) {
        applyMiddleware(onServiceRequest, req, res, next);
    });
    //server.use(routes.validators, onValidatorRequest);

    //static routes
    //server.use(routes.pages, onPageRequest);
    server.use(routes.initJS, serveInitJS);

    //this routes applies for every request that hasn't been handled before
    server.use(function onUnhandledRequestHandler(req, res, next) {
        applyMiddleware(onUnhandledRequest, req, res, next);
    });
}

exports.init = init;