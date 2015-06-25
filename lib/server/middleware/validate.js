"use strict";

var schemaMiddleware = require("alamid-schema-middleware");


function validate() {
    return function(req, res, next) {

        if(req.method.toLocaleLowerCase() === "get") {
            next();
            return;
        }

        schemaMiddleware.validate()(req, res, next);
    };
}

module.exports = validate;