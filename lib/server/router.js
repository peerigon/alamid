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

exports.get = get;
exports.set = set;
exports.init = init;