"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Disposable = require("./Disposable.class.js"),
    Event = require("../shared/Event.class.js"),
    Class = require("alamid-class");

var Base = Class(NodeEventEmitter).extend("Base", Disposable, {
    constructor: function () {
        Disposable.call(this);
        this._super();
    },
    dispose: function () {
        Disposable.prototype.dispose.call(this);
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