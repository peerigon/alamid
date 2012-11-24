"use strict";

var middler = require("middler"),
    router = null;

function get() {
    return router;
}

function set(routerInstance) {
    router = routerInstance;
    return router;
}

function init() {

    if(router === null) {
        router = middler();
    }

    return router;
}

function reset() {
    router = null;
}

exports.get = get;
exports.set = set;
exports.reset = reset;
exports.init = init;