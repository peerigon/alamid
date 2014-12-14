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
        // Emit the dispose event as soon as possible because when there is a listener,
        // it is likely that the listener needs to run code before all references have been cleared.
        this._disposed = true;
        this.emit("dispose", new DisposeEvent(this));
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