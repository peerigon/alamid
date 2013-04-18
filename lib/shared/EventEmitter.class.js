"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Class = require("alamid-class");

var EventEmitter = Class(NodeEventEmitter).extend("EventEmitter", {
    dispose: function () {
        NodeEventEmitter.prototype.removeAllListeners.call(this);
    }
});

module.exports = EventEmitter;