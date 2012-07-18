"use strict";

var paths = require('../../../shared/helpers/pathHelpers.js'),
    config = require('../../../core/config'),
    schemas = require("../../../shared/schemas.js"),
    validate = require("../../../shared/validate.js");

function runValidator(req, res, next) {

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
        //res.setStatus("error");
        //res.setErrorMessage();
        //res.setStatusCode(404);
        next(new Error("No validator found for Model '" + path + "'"));
        return;
    }

    //first validation with shared schema
    validate(sharedSchema, req.getData(), { server : true, client : true }, function(result) {

        //end it here if false OR serverSchema is not defined
        if(result.result !== true || serverSchema === null) {
            handleValidationResult(result);
            return;
        }

        //TODO only validate fields that are part of the shared schema.. validator may fail otherwise
        //second validation with server-schema if available
        validate(serverSchema, req.getData(),{ server : true, client : true }, function(result) {
            handleValidationResult(result);
        });
    });
}

module.exports = runValidator;
