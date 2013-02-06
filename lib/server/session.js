"use strict";

var fs = require("fs"),
    path = require("path"),
    log = require("../shared/logger.js").get("core");

var session = null;

/**
 * set the session Object
 * @param {!Object} sessionObject
 */
function set(sessionObject) {
    if(typeof sessionObject === "object") {
        session = sessionObject;
    }
}

/**
 * retrieve the session-object
 * @return {Object}
 */
function get() {

    if(session === null) {
        log.warn("No Session defined. Using Default-Session instead.");
        session = require("../core/defaults/defaultSession.js");
    }

    return session;
}

exports.get = get;
exports.set = set;