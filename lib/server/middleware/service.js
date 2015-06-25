"use strict";

/*
TODO maybe get serviceUrl from Service?!
 */
function service(serviceUrl, service) {

    return function(req, res, next) {

        req.ids = req.ids || {};

        var crud;

        if(req.method.toLocaleLowerCase() === "get" && !req.ids[serviceUrl]) {
            crud = "readCollection";
        }

        if(req.method.toLocaleLowerCase() === "get" && req.ids[serviceUrl]) {
            crud = "read";
        }

        if(req.method.toLocaleLowerCase() === "put") {
            crud = "update";
        }

        if(req.method.toLocaleLowerCase() === "post") {
            crud = "create";
        }

        if(!crud) {
            next(new Error("Invalid service call!"));
            return;
        }

        if(typeof service[crud] !== "function") {
            next(new Error("Not implemented"));
            return;
        }

        service[crud](req, res, next);
    };
}

module.exports = service;