"use strict";

var consoleWrapper;

exports.get = function (type) {
    if (env.isServer) {
        return require("winston").get(type);
    } else {
        return console;
    }
};