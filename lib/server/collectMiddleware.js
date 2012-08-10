"use strict";

var path = require("path"),
    fs = require("fs"),
    util = require("util");

var parseMiddlewareObject = require("./parseMiddlewareObject.js");

function collectMiddleware(definedPaths, middlewarePath, callback) {

    var middlewareDefinitions;

    fs.existsSync(path.resolve(__dirname, middlewarePath), function(exists){

        if(!exists) {
            throw new Error("(alamid) No Middleware found on path: ", middlewarePath);
        }

        middlewareDefinitions = require(middlewarePath);
        return parseMiddlewareObject(definedPaths);
    });
}

module.exports = collectMiddleware;