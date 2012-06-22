"use strict";

//fill this object!
var middleware = {
    "services" : {},
    "validators" : {}
};

/**
 * Get Middleware-Stack for given Type (services/validator), requestMethod (create/read/update/delete) and requestPath
 * This methods only works if the middleware-object was filled before. This happens in bootstrap.
 * @param {!String} requestType
 * @param {!String} requestMethod
 * @param {!String} requestPath
 * @return {!Array}
 */
function getMiddleware(requestType, requestMethod, requestPath) {

    //only expose server files and existing paths
    if(middleware[requestType][requestMethod][requestPath] !== undefined) {
        return middleware[requestType][requestMethod][requestPath];
    }

    return null;
}

exports.middleware = middleware;
exports.getMiddleware = getMiddleware;