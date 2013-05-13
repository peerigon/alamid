"use strict";

/**
 * checks if alamid-request is valid
 * = services OR validator request
 * and only CREATE for validator requests
 * @param req
 * @param res
 * @param next
 */
function isValidRequest(req, res, next) {

    var type = req.getType(),
        method = req.getMethod();

    if(type === "validator" && method !== "create") {
        next(new Error("Validator Requests have to be called with method 'CREATE'"));
        return;
    }

    if(type === "validator" || type === "service") {
        next();
        return;
    }

    next(new Error("Invalid Request-Type '" + type + "'"));
}

module.exports = isValidRequest;