"use strict";

var NodeEventEmitter = require("events").EventEmitter,
    Event = require("../shared/Event.class.js"),
    Class = require("alamid-class");

var Base = Class(NodeEventEmitter).extend("Base", {
    _disposed: false,
    constructor: function () {
        this._super();
        this.dispose = createDisposeGuard(this.dispose);
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
 * Returns a function which ensures that dispose() is only called once.
 */
function createDisposeGuard(dispose) { /* jshint validthis: true */
    return function disposeGuard() {
        if (this._disposed) {
            return;
        }
        dispose.call(this);
    };
}

/**
 * @class DisposeEvent
 * @extends Event
 */
var DisposeEvent = Event.extend("DisposeEvent", {
    name: "DisposeEvent"
});

module.exports = Base;