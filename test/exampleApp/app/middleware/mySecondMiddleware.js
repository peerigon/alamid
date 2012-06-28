"use strict";

function myFirstMiddleware(req, res, next) {
    next();
}

module.exports = myFirstMiddleware;