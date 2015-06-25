"use strict";

/**
 * checks if alamid-request is valid
 * = services OR validator request
 * and only CREATE for validator requests
 *
 * @param req
 * @param res
 * @param next
 */
function isValidRequest(req, res, next) {

    var type = req.type || "unknown",
        method = req.method.toLocaleLowerCase();

    if(type === "validator" && method !== "post") {
        next(new Error("Validator Requests have to be called with method 'POST'"));
        return;
    }

    if(type === "validator" || type === "service") {
        next();
        return;
    }

    next(new Error("Invalid Request-Type '" + type + "'"));
}

module.exports = isValidRequest;