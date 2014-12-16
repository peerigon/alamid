"use strict";

var middler = require("middler"),
    httpCrud = require("../shared/helpers/httpCrud.js");

var router = {
    http: null,
    alamid: null
};

function get(type) {

    type = type || "alamid";

    if (router[type] === null) {
        router[type] = middler();

        //extension to be able to use crud methods instead of HTTP-methods
        router[type].addAlamidRoute = function (methods, route, fns) {

            var args = Array.prototype.slice.call(arguments);

            if (!Array.isArray(args[0])) {
                args[0] = [args[0]];
            }

            args[0].forEach(function (method, index) {
                args[0][index] = httpCrud.convertCRUDtoHTTP(method);
            });

            router[type].add.apply(router[type], args);
        };
    }

    return router[type];
}

function set(routerInstance, type) {
    type = type || "alamid";
    return router[type] = routerInstance;
}

function reset(type) {

    if (type !== undefined) {
        router[type] = null;
        return;
    }

    router.alamid = null;
    router.http = null;
}

exports.get = get;
exports.set = set;
exports.reset = reset;