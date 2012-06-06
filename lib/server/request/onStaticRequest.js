"use strict";

var connect = require('connect'),
    paths = require('../../core/paths.js'),
    config = require('../../core/config'),
    devLogger = require("./middleware/devLogger.js");

function onStaticRequest (req, res, next) {

    var staticFileServer;

    if (config.isDev) {
        staticFileServer = connect.static(
            paths.appStatics         // maxAge defaults to 0
        );
        requests.unshift(devLogger.handler);
    } else {
        staticFileServer = connect.static(
            paths.appStatics,
            {maxAge: 2 * 60 * 60 * 1000}   // cache for 2 hours
        );
    }

    staticFileServer(req, res, next);
}

module.exports = onStaticRequest;