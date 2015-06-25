"use strict";

var schemaMiddleware = require("alamid-schema-middleware");

exports.schema = schemaMiddleware.useSchema;

exports.validate = function() {

    return function(req, res, next) {

        if(req.method.toLocaleLowerCase() === "get") {
            next();
            return;
        }

        schemaMiddleware.validate()(req, res, next);
    };
};

exports.writeableFields = schemaMiddleware.writeableFields;

exports.parseIds = require("./parseIds");

exports.service = require("./service");
exports.validator = require("./validator");