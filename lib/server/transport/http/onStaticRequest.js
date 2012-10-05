"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("connect").logger("short"),
    staticFileHandler = require("./middleware/staticFileHandler.js");

var middleware = [
        staticFileHandler
    ];

function onStaticRequest() {

    if(config.isDev) {
        middleware.unshift(logger);
    }

    return middleware;
}

module.exports = onStaticRequest();