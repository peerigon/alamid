"use strict";

var paths = require('../../../shared/helpers/pathHelpers.js'),
    config = require('../../../core/config'),
    schemas = require("../../../shared/schemas.js"),
    validate = require("../../../shared/validate.js").validate;

function runValidator(req, res, next) {

    var field;

    function handleValidationResult(result) {
        if(result.result !== true) {
            res.setStatus("fail");
            res.setErrorMessage("Validation failed.");
        }
        //append result-data as body!
        res.setData(result);
        next();
    }

    var path = req.getPath(),
        sharedSchema = schemas.getSchema(path, "shared"),
        serverSchema = schemas.getSchema(path, "server");

    if(sharedSchema === null) {
        next(new Error("No shared-schema found for Model '" + path + "'"));
        return;
    }

    if(serverSchema === null) {
        next(new Error("No server-schema found for Model '" + path + "'"));
        return;
    }

    //remove all keys that are in serverSchema but not in sharedSchema
    for(field in serverSchema) {
        if(serverSchema.hasOwnProperty(field)){
            if(sharedSchema[field] === undefined) {
                delete serverSchema[field];
            }
        }
    }

    //validate shared & stripped-down-server schema
    validate(sharedSchema, serverSchema, req.getData(), true, handleValidationResult);
}

module.exports = runValidator;
