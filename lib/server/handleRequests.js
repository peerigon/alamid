"use strict";

var connect = require("connect"),
    routes = require("./routes.js");

//handlers for routes
var onStaticRequest = require("./request/onStaticRequest.js"),
    onUnhandledRequest = require("./request/onUnhandledRequest.js"),
    onRequest = require("./request/onRequest.js");
    //onServiceRequest = require("./request/onServiceRequest.js"),
    //onValidatorRequest = require("./request/onValidatorRequest.js"),
    //onPageRequest = require("./request/onPageRequest.js"),

    //serveInitJS = require("./request/middleware/serveInitJS.js");

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