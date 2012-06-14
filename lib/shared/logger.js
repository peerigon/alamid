"use strict";

var consoleWrapper;

exports.get = function (type) {
    if (env.isServer) {
        return require("winston").get(type);
    } else {
        return {
            "log" : function(msg) { console.log(msg); },
            "info" : function(msg){ console.log(msg); }
        }
    }
};