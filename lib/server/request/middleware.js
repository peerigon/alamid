"use strict";

//fill this object!
var middleware = {
    "services" : {},
    "validators" : {}
};

function setMiddleware(reqType, middlewareObj) {
    middleware[reqType] = middlewareObj;
}

/**
 * Get Middleware-Stack for given Type (services/validator), requestMethod (create/read/update/delete) and requestPath
 * This methods only works if the middleware-object was filled before. This happens in bootstrap.
 * @param {!String} reqType
 * @param {!String} reqPath
 * @param {!String} reqMethod
 * @return {!Array}
 */
function getMiddleware(reqType, reqPath, reqMethod) {

    if(middleware[reqType][reqPath] === undefined) {
        return [];
    }

    return middleware[reqType][reqPath][reqMethod] || [];
}

exports.middleware = middleware;
exports.getMiddleware = getMiddleware;
exports.setMiddleware = setMiddleware;