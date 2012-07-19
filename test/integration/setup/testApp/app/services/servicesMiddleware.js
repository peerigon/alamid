"use strict";

var middleware = {
    "read /user" : function universalMiddleware(req, res, next) {
        console.log("middleware called!");
    }
};

module.exports = middleware;