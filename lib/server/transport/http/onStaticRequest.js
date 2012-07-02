"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    devLogger = require("./middleware/devLogger.js"),
    staticFileHandler = require("./middleware/staticFileHandler.js");

var middleware = [
        staticFileHandler
    ];


function onStaticRequest() {

    if(config.isDev) {
        middleware.unshift(devLogger.handler);
    }

    return middleware;
}

module.exports = onStaticRequest();