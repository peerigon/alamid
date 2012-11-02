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

exports.util = {
    Class: nodeclass.Class,
    underscore: require("underscore"),
    logger : require("./shared/logger.js")
};

exports.config = config;

//Server classes
exports.Server = require("./server/Server.class.js");
exports.Bundler = require("./core/bundle/Bundler.class.js");

// Server Bootstrap
var bootstrapServer = require("./server/bootstrap.server.js"),
    startAlamidServer = require("./server/startServer.js");

//to be handled via Server class soon
exports.startServer = function() {
    bootstrapServer();
    return startAlamidServer();
};

exports.setSocketIOOptions = require("./server/transport/websocket/websocket.js").setSocketIOOptions;
exports.setConnectInstance = require("./server/transport/http/http.js").setConnectInstance;

// Create Bundle
exports.createBundle = function(callback) {
    runCreateBundle(config, callback);
};