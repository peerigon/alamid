"use strict";

function validator() {
    return function(req, res, next) {

        next();
    };
}

module.exports = validator;