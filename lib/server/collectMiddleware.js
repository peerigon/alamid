"use strict";

var path = require("path"),
    fs = require("fs"),
    util = require("util");

var parseMiddlewareObject = require("./parseMiddlewareObject.js");

function collectMiddleware(definedPaths, middlewarePath) {

    var middlewareDefinitions;

    if(fs.existsSync(path.resolve(__dirname, middlewarePath))) {

        middlewareDefinitions = require(middlewarePath);
        return parseMiddlewareObject(definedPaths);
    }
    else {
        throw new Error("(alamid) No Middleware found on path: ", middlewarePath);
    }
}

module.exports = collectMiddleware;