"use strict";

var schemaMiddleware = require("alamid-schema-middleware");

exports.schema = schemaMiddleware.useSchema;
exports.validate = require("./validate");
exports.writeableFields = schemaMiddleware.writeableFields;

exports.parseIds = require("./parseIds");

exports.service = require("./service");
exports.validator = require("./validator");