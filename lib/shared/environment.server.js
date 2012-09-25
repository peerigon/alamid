"use strict";

var env = "server";

exports.isServer = function() {
    return true;
};

exports.isClient = function() {
    return false;
};

exports.env = env;
