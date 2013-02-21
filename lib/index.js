"use strict";

// Initialize config first
var config = require("./shared/config.js"),
    env = require("./shared/env.js"),
    Class = require("alamid-class");

Class.dev = env.isDevelopment();

exports.config = config;
exports.env = env;

exports.util = {};
exports.util.Class = Class;
exports.util.logger = require("./shared/logger.js");
exports.util.underscore = require("underscore");
exports.util.value = require("value");

exports.Collection = require("./shared/Collection.class.js");
exports.EventEmitter = require("./shared/EventEmitter.class.js");
exports.Event = require("./shared/Event.class.js");
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");
exports.Service = require("./shared/Service.class.js");

// export environment specific stuff
require("./index.server.js")(module.exports);