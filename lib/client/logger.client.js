"use strict";

var logger = {
    "info" : function(msg) { console.log("info: " +msg); },
    "warn" : function(msg) { console.log("warn:" + msg); },
    "error" : function(msg) { console.log("error:" + msg); },
    "debug" : function(msg) { console.log("debug:" + msg); },
    "verbose" : function(msg) { console.log("verbose:" + msg); },
    "silly" : function(msg) { console.log("verbose:" + msg); }
};

exports.get = function get (type) {
    return logger;
};