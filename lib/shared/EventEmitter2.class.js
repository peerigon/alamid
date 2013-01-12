"use strict";

var Class = require("alamid-class"),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    _ = require("underscore"),
    addListener =  EventEmitter2.prototype.on,
    removeListener = EventEmitter2.prototype.removeListener;

var EventEmitter = new Class(EventEmitter2).extend({

    _originalEvents : {},

    addListener : function(type, listener, scope) {

        console.log("addListener");

        var boundListener = listener.bind(scope);
        this._super(type, boundListener);

        if (!this._originalEvents[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            this._originalEvents[type] = [listener];
        }
        else {
            // If we've already got an array, just append.
            this._originalEvents[type].push(listener);
        }
    },

    removeListener : function(type, listener) {

        console.log("removeListener");

        var list = this._originalEvents[type],
            boundListener;

        var position = -1;
        for (var i = 0, length = list.length; i < length; i++) {
            if (list[i] === listener) {
                position = i;
                break;
            }
        }

        if (position < 0) {
            return this;
        }

        var res = list.splice(position, 1);

        boundListener = res[0];

        if (list.length === 0) {
            this._originalEvents[type] = null;
        }

        console.log("boundLostener", boundListener);

        return this._super(type, boundListener);
    }
});

console.log(EventEmitter.prototype.addListener.toString());

EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

module.exports = EventEmitter;