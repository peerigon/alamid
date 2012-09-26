"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    nodeclass = require("nodeclass");

var config = require("./shared/config.js");
var runCreateBundle = require("./core/bundle/runCreateBundle.js");

// Shared classes
exports.Collection = require("./shared/Collection.class.js");
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");

exports.Service = require("./shared/Service.class.js");

// Server Bootstrap
var bootstrapServer = require("./server/bootstrap.server.js");
exports.startServer = bootstrapServer;

exports.util = {
    Class: nodeclass.Class,
    is: nodeclass.is,
    isEach: nodeclass.isEach,
    _: require("underscore"),
    logger : require("./shared/logger.js")
};

exports.config = config;


// Create Bundle
exports.createBundle = function(callback) {
    runCreateBundle(config, function () {

    });
};