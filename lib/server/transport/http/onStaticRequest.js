"use strict";

var connect = require("connect"),
    config = require("../../../core/config"),
    paths = config.paths,
    iterateMiddlewares = require('../../iterateMiddlewares.js'),
    //devLogger = require("./middleware/devLogger.js"),
    log = require("../../../core/logger.js").get("server");

var middlewares = [
        handleStaticFileRequest,
        staticFileNotFound
    ];

function staticFileNotFound(req, res, next) {
    res.end("Not found");
}

function handleStaticFileRequest (req, res, next) {

    var staticFileServer;

    if (config.mode === "development") {
        staticFileServer = connect.static(
            paths.statics         // maxAge defaults to 0
        );
        //staticRequest.unshift(devLogger.handler);
        log.info("static request received");
    }
    else {
        staticFileServer = connect.static(
            paths.statics,
            {maxAge: 2 * 60 * 60 * 1000}   // cache for 2 hours
        );
    }

    staticFileServer(req, res, next);
}

function onStaticRequest(req, res, next) {
    iterateMiddlewares(middlewares, req, res, next);
}


module.exports = onStaticRequest;