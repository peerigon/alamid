"use strict";

var fs = require("fs"),
    path = require("path");

var session = null;

function set(sessionObject) {
    session = sessionObject;
}

function get() {
    return session;
}

exports.get = get;
exports.set = set;