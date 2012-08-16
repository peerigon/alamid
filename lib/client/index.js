"use strict"; // run code in ES5 strict mode

var nodeclass = require("nodeclass");

exports.DisplayObject = require("./DisplayObject.class.js");
exports.Page = require("./Page.class.js");
exports.View = require("./View.class.js");
exports.ViewCollection = require("./ViewCollection.class.js");
exports.Model = require("../shared/Model.class.js");
exports.ModelCollection = require("../shared/ModelCollection.class.js");
exports.EventEmitter = require("../shared/EventEmitter.class.js");
exports.Collection = require("../shared/Collection.class.js");

exports.logger = require("./logger.client.js");

exports.util = {
    Class: nodeclass.Class,
    is: nodeclass.is,
    isEach: nodeclass.isEach,
    _: require("underscore")
};
