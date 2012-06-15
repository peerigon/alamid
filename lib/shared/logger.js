"use strict";

/*
 LOG LEVELS
 silly: 0,
 verbose: 1,
 info: 2,
 warn: 3,
 debug: 4,
 error: 5
 */

var mode = {};

var consoleWrapper = {
    "info" : function(msg) { console.log("info: " +msg); },
    "warn" : function(msg) { console.log("warn:" + msg) },
    "error" : function(msg) { console.log("error:" + msg) },
    "debug" : function(msg) { console.log("debug:" + msg) },
    "verbose" : function(msg) { console.log("verbose:" + msg) },
    "silly" : function(msg) { console.log("verbose:" + msg) }
};

exports.get = function (type) {
    if (mode.isServer) {
        return require("../core/logger.js").get(type);
    } else {
        return consoleWrapper;
    }
};