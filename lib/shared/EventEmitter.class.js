"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Disposable = require("./Disposable.class.js"),
    value = require("value");

var EventEmitter = Disposable.extend("Disposable", NodeEventEmitter, {
    constructor: function () {
        NodeEventEmitter.call(this);
        this._super();
    },
    dispose: function () {
        NodeEventEmitter.prototype.removeAllListeners.call(this);
        this._super();
    }
});

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

module.exports = EventEmitter;