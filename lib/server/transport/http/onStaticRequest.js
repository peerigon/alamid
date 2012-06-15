"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    devLogger = require("./middleware/devLogger.js"),
    staticFileNotFound = require("./middleware/staticFileNotFound.js"),
    staticFileHandler = require("./middleware/staticFileHandler.js");

var middleware = [
        staticFileHandler,
        staticFileNotFound
    ];


function onStaticRequest() {

    if(config.isDev) {
        middleware.unshift(devLogger.handler);
    }

    return middleware;
}

module.exports = onStaticRequest();