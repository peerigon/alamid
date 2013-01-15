"use strict";

var config = require("../shared/config");

exports.env = config.env;

exports.isProduction = function() {
    return config.env === "production";
};

exports.isDevelopment = function() {
    return config.env === "development";
};

exports.isTesting = function() {
    return config.env === "testing";
};

exports.isServer = function() {
    return true;
};

exports.isClient = function() {
    return false;
};
