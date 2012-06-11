"use strict";

var connect = require("connect"),
    config = require("../../../core/config"),
    paths = config.paths,
    devLogger = require("./middleware/devLogger.js"),
    staticFileNotFound = require("./middleware/staticFileNotFound.js"),
    log = require("../../../core/logger.js").get("server");

var middleware = [
        staticFileNotFound
    ];

function getStaticFileHandler() {

    //cache for 2 hours
    var maxAge = 2 * 60 * 60 * 1000,
        connectStatic = null;

    //no cache in dev
    if(config.isDev) {
        maxAge = 0;
    }

    connectStatic = connect.static(
        paths.statics,
        {maxAge: maxAge}   // cache for 2 hours
    );

    return connectStatic;
}


function onStaticRequest() {

    middleware.unshift(getStaticFileHandler());

    if(config.isDev) {
        middleware.unshift(devLogger.handler);
    }
    return middleware;
}

module.exports = onStaticRequest();