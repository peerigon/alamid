"use strict";

var middler = require("middler"),
    httpCrud = require("../shared/helpers/httpCrud.js");

var router = {
    http:  null,
    alamid:null
};

function get(type) {

    type = type || "alamid";

    if (router[type] === null) {
        router[type] = middler();

        //extension to be able to use crud methods instead of HTTP-methods
        router[type].addAlamidRoute = function (methods, route, fns) {

            if (!Array.isArray(methods)) {
                methods = [methods];
            }

            methods.forEach(function (method, index) {
                methods[index] = httpCrud.convertCRUDtoHTTP(method);
            });

            this.add(methods, route, fns);
        };
    }

    return router[type];
}

function set(routerInstance, type) {
    type = type || "alamid";
    return router[type] = routerInstance;
}

function reset (type) {

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