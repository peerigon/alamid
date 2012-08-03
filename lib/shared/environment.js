"use strict";

var env = "server";

exports.isServer = function() {
    return env === "server";
};

exports.isClient = function() {
    return env === "client";
};

exports.env = env;
