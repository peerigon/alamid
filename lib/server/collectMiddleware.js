"use strict";

var path = require("path"),
    fs = require("fs"),
    util = require("util");

var parseMiddlewareObject = require("./parseMiddlewareObject.js");

function collectMiddleware(definedPaths, middlewarePath, callback) {

    var middlewareDefinitions;

    fs.exists(path.resolve(__dirname, middlewarePath), function(exists){

        if(!exists) {
            callback(new Error("No Middlewares found on path: ", middlewarePath), {});
            return;
        }

        middlewareDefinitions = require(middlewarePath);
        callback(null, parseMiddlewareObject(definedPaths, middlewareDefinitions));
    });
}

module.exports = collectMiddleware;