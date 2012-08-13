"use strict";

var path = require("path"),
    fs = require("fs"),
    util = require("util");

var parseMiddlewareObject = require("./parseMiddlewareObject.js");

/**
 * collect middleware for the given path and merge found middleware with definedPaths
 * @param {!Object} definedPaths
 * @param {!String} middlewarePath
 * @return {Object}
 * @throws {Error} When middleware path does not exist
 */
function collectMiddleware(definedPaths, middlewarePath) {

    var middlewareDefinitions;

    if(fs.existsSync(path.resolve(__dirname, middlewarePath))) {

        middlewareDefinitions = require(middlewarePath);
        return parseMiddlewareObject(definedPaths, middlewareDefinitions);
    }
    else {
        throw new Error("(alamid) No Middleware found on path: ", middlewarePath);
    }
}

module.exports = collectMiddleware;