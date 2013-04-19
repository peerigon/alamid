"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Event = require("../shared/Event.class.js"),
    Class = require("alamid-class");

var Base = Class(NodeEventEmitter).extend("Base", {
    constructor: function () {
        this._super();
    },
    dispose: function () {
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