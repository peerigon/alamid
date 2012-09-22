"use strict";

//Export some useful utilities
exports.util = {
    underscore: require("underscore"),
    jQuery: require("./client/helpers/jQuery.js"),
    history: require("./client/helpers/historyAdapter.js"),
    logger: require("./client/logger.client.js"),
    Class: require("nodeclass").Class,
    is: require("nodeclass").is
};

exports.config = require("./client/config.client.js");

//Export alamid's client-heart
exports.App = require("./client/App.class.js");

//Export displayable Classes
exports.DisplayObject = require("./client/DisplayObject.class.js");
exports.View = require("./client/View.class.js");
exports.ViewCollection = require("./client/ViewCollection.class.js");
exports.Page = require("./client/Page.class.js");

//Export Classes to work with data
exports.Collection = require("./shared/Collection.class.js");
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");

//Export Classes for data loading
exports.Service = require("./shared/Service.class.js");