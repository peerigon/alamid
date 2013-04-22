"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Event = require("../shared/Event.class.js"),
    Class = require("alamid-class");

var Base = Class(NodeEventEmitter).extend("Base", {
    _disposed: false,
    constructor: function () {
        this._super();
    },
    isDisposed: function () {
        return this._disposed === true;
    },
    dispose: function () {
        this._disposed = true;
        this.emit("dispose", new DisposeEvent(this));
        NodeEventEmitter.prototype.removeAllListeners.call(this);
    }
});

/**
 * @class DisposeEvent
 * @extends Event
 */
var DisposeEvent = Event.extend("DisposeEvent", {
    name: "DisposeEvent"
});

module.exports = Base;