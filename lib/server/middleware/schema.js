"use strict";

function schema(schema) {
    return function(req, res, next) {
        req.schema = schema;

        next();
    }
}

module.exports = schema;