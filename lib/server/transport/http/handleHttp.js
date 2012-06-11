"use strict";

var connect = require("connect"),
    routes = require("../../routes.js");

//handlers for routes
var onStaticRequest = require("./onStaticRequest.js"),
    onUnhandledRequest = require("./onUnhandledRequest.js"),
    //onPageRequest = require("./onPageRequest.js"),
    onRequest = require("./onRequest.js");
    //onServiceRequest = require("./onServiceRequest.js"),
    //onValidatorRequest = require("./onValidatorRequest.js"),

    //serveInitJS = require("./middleware/serveInitJS.js");

function init(server) {

    server.use(onRequest); //every request has this handler

    //dynamic routes
    //server.use(routes.services, onServiceRequest);
    //server.use(routes.validators, onValidatorRequest);


    //static routes
    //server.use(routes.pages, onPageRequest);
    server.use(routes.statics, onStaticRequest);
    //server.use(routes.initJS, serveInitJS);

    //the rest
    server.use(onUnhandledRequest);
}

exports.init = init;