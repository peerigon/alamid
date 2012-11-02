"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    nodeclass = require("nodeclass");

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

var config = require("./shared/config.js");
exports.config = config;

//Server classes
var Bundler = require("./core/bundle/Bundler.class.js");
exports.Server = require("./server/Server.class.js");
exports.Bundler = Bundler;

// Create Bundle
exports.createBundle = function(callback) {
    var bundle = new Bundler();
    bundle.create(config, callback);
};