"use strict";

var env = "client";

exports.isServer = function() {
    return false;
};

exports.isClient = function() {
    return true;
};

exports.env = env;