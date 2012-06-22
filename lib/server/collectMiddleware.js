"use strict";

var path = require("path"),
    _ = require("underscore"),
    util = require("util");

var config = require("../shared/config"),
    parseMiddlewareObject = require("./parseMiddlewareObject.js");

function collectMiddleware(middlewarePath, callback) {

    var middlewareDefinitions,
        middleware = {};

    if(!path.exists(middlewarePath)) {
        callback(null, {});
        return;
    }

    middlewareDefinitions = require(middlewarePath);
}

