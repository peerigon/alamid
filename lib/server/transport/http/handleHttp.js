"use strict";

var connect = require("connect"),
    routes = require("../../routes.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    onRequest = require("./onRequest.js");

    //onPageRequest = require("./onPageRequest.js"),
    //onServiceRequest = require("./onServiceRequest.js"),
    //onValidatorRequest = require("./onValidatorRequest.js"),
    //serveInitJS = require("./middleware/serveInitJS.js");

function init(server) {

    //every request has this handler
    server.use(function onRequestHandler(req, res, next) {
        iterateMiddlewares(onRequest, req, res, next);
    });

    server.use(routes.statics, function onStaticRequestHandler(req, res, next) {
        iterateMiddlewares(onStaticRequest, req, res, next);
    });


    //dynamic routes
    //server.use(routes.services, onServiceRequest);
    //server.use(routes.validators, onValidatorRequest);

    //static routes
    //server.use(routes.pages, onPageRequest);
    //server.use(routes.initJS, serveInitJS);

    //this routes applies for every request that hasn't been handled before
    server.use(function onUnhandledRequestHandler(req, res, next) {
        iterateMiddlewares(onUnhandledRequest, req, res, next);
    });
}

exports.init = init;