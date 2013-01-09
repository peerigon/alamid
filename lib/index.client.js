"use strict";

//Export some useful utilities
exports.util = {
    underscore: require("underscore"),
    jQuery: require("./client/helpers/jQuery.js"),
    //history: require("./client/helpers/historyAdapter.js"),
    logger: require("./client/logger.client.js"),
    Class: require("alamid-class")
};

// Setup
exports.config = require("./client/config.client.js");
exports.env = require("./client/env.client.js");

// Shared classes
exports.Collection = require("./shared/Collection.class.js");
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");
exports.Service = require("./shared/Service.class.js");

// Client-only classes
exports.DisplayObject = require("./client/DisplayObject.class.js");
exports.View = require("./client/View.class.js");
exports.ViewCollection = require("./client/ViewCollection.class.js");
exports.Page = require("./client/Page.class.js");