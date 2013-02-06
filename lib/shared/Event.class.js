"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class"),
    value = require("value");

/**
 * Represents an event that will be passed to every event listener as first parameter.
 *
 * @class Event
 */
var Event = new Class("Event", {

    /**
     * The object that emitted the event.
     *
     * @type {Object}
     */
    target: null,

    /**
     * @param {Object} target
     * @throws {TypeError}
     * @constructor
     */
    constructor: function (target) {
        if (value(target).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot create event: You haven't specified a target");
        }
        this.target = target;
    }
});

module.exports = Event;