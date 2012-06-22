"use strict";


var middleware = {};

function getMiddleware(requestType, path) {

    //only expose server files and existing paths
    if(middleware[requestType][path] !== undefined) {
        return middleware[requestType][path];
    }

    return null;
}

exports.middleware = middleware;
exports.getMiddleware = getMiddleware;