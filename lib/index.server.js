"use strict"; // run code in ES5 strict mode

var config = require("./shared/config.js");

exports.util = {
    Class: require("alamid-class"),
    underscore: require("underscore"),
    logger : require("./shared/logger.js")
};

// Setup
exports.config = config;
exports.env = require("./server/env.server.js");

// Shared classes
exports.Collection = require("./shared/Collection.class.js");
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");
exports.Service = require("./shared/Service.class.js");

// Server-only classes
var Bundler = require("./core/bundle/Bundler.class.js");
exports.Server = require("./server/Server.class.js");
exports.Bundler = Bundler;

// Create Bundle
exports.createBundle = function (callback) {
    var bundle = new Bundler();
    bundle.create(config, callback);
};