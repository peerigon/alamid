"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    nodeclass = require("nodeclass");

var config = require("./shared/config.js");
var createBundle = require("./core/bundle/createBundle.js");

// Shared classes
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");

// Server Bootstrap
var bootstrapServer = require("./server/bootstrap.server.js");
exports.startServer = bootstrapServer;



exports.util = {
    Class: nodeclass.Class,
    is: nodeclass.is,
    isEach: nodeclass.isEach,
    _: require("underscore")
};

exports.config = config;

// Create Bundle
exports.createBundle = function(callback) {
    createBundle(config, callback);
};