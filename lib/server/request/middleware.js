"use strict";

//fill this object!
var middleware = {
    "services" : {},
    "validators" : {}
};

/**
 * Get Middleware-Stack for given Type (services/validator), requestMethod (create/read/update/delete) and requestPath
 * This methods only works if the middleware-object was filled before. This happens in bootstrap.
 * @param {!String} reqType
 * @param {!String} reqMethod
 * @param {!String} reqPath
 * @return {!Array}
 */
function getMiddleware(reqType, reqMethod, reqPath) {

    //only expose server files and existing paths
    if(middleware[reqType][reqMethod][reqPath] !== undefined) {
        return middleware[reqType][reqMethod][reqPath];
    }

    return [];
}

exports.middleware = middleware;
exports.getMiddleware = getMiddleware;