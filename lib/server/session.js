"use strict";

var fs = require("fs"),
    path = require("path");

var session = null;

/**
 * set the session Object
 * @param {!Object} sessionObject
 */
function set(sessionObject) {
    session = sessionObject;
}

/**
 * retrieve the session-object
 * @return {Object}
 */
function get() {
    return session;
}

exports.get = get;
exports.set = set;