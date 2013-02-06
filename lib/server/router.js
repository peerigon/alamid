"use strict";

var middler = require("middler"),
    router = {
        http : null,
        alamid : null
    };

function get(type) {
    type = type || "alamid";
    return router[type];
}

function set(routerInstance, type) {
    type = type || "alamid";
    return router[type] = routerInstance;
}

function init(type) {

    type = type || "alamid";

    if(router[type] === null) {
        return router[type] = middler();
    }

    return router[type];
}

function reset() {
    router = null;
}

exports.get = get;
exports.set = set;
exports.reset = reset;
exports.init = init;