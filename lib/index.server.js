"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    nodeclass = require("nodeclass");

// Shared classes
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");

// Server Bootstrap
var bootrapServer = require("./server/bootstrap.server.js");
exports.startServer = bootrapServer;

exports.util = {
    Class: nodeclass.Class,
    is: nodeclass.is,
    isEach: nodeclass.isEach,
    _: require("underscore")
};


// Environment specific
// This require will turn into index.client.js during the bundling process
//_(exports).extend(require("./index.server.js"));

// Instances
exports.config = null;