"use strict";

var config = require("../shared/config");

//What's the env?
exports.isProduction = function() {
    return config.env === "production";
};

exports.isDevelopment = function() {
    return config.env === "development";
};

exports.isTesting = function() {
    return config.env === "testing";
};

/**
 * check if the current env is the expectedEnv
 * @param {String} expectedEnv
 * @return {Boolean}
 */
exports.is = function (expectedEnv) {
    return config.env === expectedEnv;
};

//Server or Client?
exports.isServer = function() {
    return false;
};

exports.isClient = function() {
    return true;
};