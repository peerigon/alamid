"use strict";

var async = require("async");

var log = require("./logger").get("shared"),
    config = require("./config.js"),
    alamidValidators = require("./helpers/alamidValidators.js");

function remoteValidation(modelUrl, modelData, callback) {

    var request = require("../client/remoteRequest.js").request;

    if(config.isServer === true) {
        throw new Error("(alamid) You cannot call remoteValidation on the server");
    }

    //make full path
    var url = "";

    if(config.basePath !== undefined && config.basePath !== null) {
        url += config.basePath;
    }

    url += "/validators/" + modelUrl;

    //make request here
    request("create", url, modelData, callback);
}

//force: true -> expect full model
//force: false -> expect only certain fields
function localValidation(schema, modelData, callback) {
    var result = {
        result : true,
        fields : {}
    };

    function runFieldValidation(field, fieldValidationDoneCallback) {
        var validationCallResult = {};

        function runValidatorCallback(validationResult) {
            if (validationCallResult.called) {
                throw new Error("(alamid) Function '" +
                    Object.prototype.toString.call(null, schema[field].validator) +
                    "' returns multiple values");
            }
            validationCallResult.called = true;

            //set the result
            result.fields[field] = validationResult;

            if(validationResult !== true) {
                result.result = false;
            }
        }

        //default alamid validators
        if(schema[field].required === true) {
            if(alamidValidators.checkRequired(modelData[field]) !== true) {
                runValidatorCallback("required");
                fieldValidationDoneCallback();
                return;
            }
        }
        if(schema[field].enum instanceof Array) {
            if(alamidValidators.checkEnum(modelData[field], schema[field].enum) !== true) {
                runValidatorCallback("enum");
                fieldValidationDoneCallback();
                return;
            }
        }
        if(typeof schema[field].min === "number") {
            if(alamidValidators.checkMin(modelData[field], schema[field].min) !== true) {
                runValidatorCallback("min");
                fieldValidationDoneCallback();
                return;
            }
        }
        if(typeof schema[field].max === "number") {
            if(alamidValidators.checkMax(modelData[field], schema[field].max) !== true) {
                runValidatorCallback("max");
                fieldValidationDoneCallback();
                return;
            }
        }

        if(schema[field].validate !== undefined) {
            validationCallResult = schema[field].validate.call(null, modelData[field], runValidatorCallback);
        }
        else {
            //no validation found
            validationCallResult = true;
        }

        if (validationCallResult !== undefined) {
            runValidatorCallback(validationCallResult);
        }
        fieldValidationDoneCallback();
    }

    //START
    async.forEach(Object.keys(schema), runFieldValidation, function(err){
        if(err) {
            throw err;
        }
        callback(result);
    });
}

/**
 * Validate model-data on shared, local and remote schemas.
 * If used on client, the validator will also call remote validation
 * @param {Object} sharedSchema
 * @param {Object} localSchema
 * @param {String} modelUrl
 * @param {Object} modelData
 * @param {String} remote
 * @param {Function} callback
 */
function validate(sharedSchema, localSchema, modelUrl, modelData, remote, callback) {

    var overallResult = {
        result : false
    };

    //1. Validate SHARED locally
    localValidation(sharedSchema, modelData, function(sharedResult) {
        overallResult.result = sharedResult.result;
        overallResult.shared = sharedResult;
        //check for second full-validation if shared worked out
        if(remote && sharedResult.result !== false) {
            //2. Validate LOCAL locally
            localValidation(localSchema, modelData, function(localResult) {
                overallResult.result = localResult.result;
                overallResult.local = localResult;

                if(localResult.result === true && config.isClient) {
                    //3. (ONLY CLIENT) run REMOTE validation
                    remoteValidation(modelUrl, modelData, function(remoteResult) {
                        overallResult.result = remoteResult.result;
                        overallResult.remote = remoteResult;
                        callback(overallResult);
                    });
                }
                else {
                    callback(overallResult);
                }
            });
        }
        //first validation failed! return here
        else {
            overallResult.shared = sharedResult;
            callback(overallResult);
        }
    });
}

exports.localValidation = localValidation;
exports.validate = validate;
exports.remoteValidation = remoteValidation;
