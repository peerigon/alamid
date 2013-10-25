"use strict";

var paths = require('../../../shared/helpers/pathHelpers.js'),
    _ = require("underscore"),
    config = require('../../../shared/config.js'),
    schemas = require("../../../shared/registries/schemaRegistry.js"),
    validate = require("../../../shared/validator.js").validate;

/**
 * run service-side validators
 * tests shared-schema first, then the localSchema
 * @param req
 * @param res
 * @param next
 */
function runValidator(req, res, next) {

    var field;

    function handleValidationResult(result) {
        if (result.result !== true) {
            res.setStatus("fail");
            res.setErrorMessage("Validation failed.");
        }
        //append result-data as body!
        res.setData(result);
        next();
    }

    var path = req.getPath(),
        sharedSchema = schemas.getSchema(path, "shared"),
        //we modify the schemas below and need a copy
        serverSchema = schemas.getSchema(path, "server"),
        serverSchemaOnlySharedFields = {};

    if (sharedSchema === null) {
        next(new Error("No shared-schema found for Model '" + path + "'"));
        return;
    }

    if (serverSchema === null) {
        next(new Error("No server-schema found for Model '" + path + "'"));
        return;
    }

    //extract server validators for all fields of the sharedSchema
    for (field in serverSchema) {
        if (serverSchema.hasOwnProperty(field)) {
            if (sharedSchema[field] !== undefined) {
                serverSchemaOnlySharedFields[field] = serverSchema[field];
            }
        }
    }

    //validate shared & stripped-down-server schema
    validate(sharedSchema, serverSchemaOnlySharedFields, path, req.data, true, handleValidationResult);
}

module.exports = runValidator;
