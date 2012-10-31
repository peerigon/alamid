"use strict";

var async = require("async"),
    _ = require("underscore");

var log = require("./logger").get("shared"),
    config = require("./config.js"),
    environment = require("./environment.js"),
    alamidValidators = require("./helpers/alamidValidators.js");

/**
 * calls the remote validator via request and returns the result
 * @param {String} modelUrl
 * @param {!Object} modelData
 * @param {Function} callback
 */
function remoteValidation(modelUrl, modelData, callback) {

    var request = require("../client/request.js");

    if(environment.isServer()) {
        throw new Error("(alamid) You cannot call remoteValidation on the server");
    }

    //make full path
    var url = "";

    if(config.basePath !== undefined && config.basePath !== null) {
        url += config.basePath;
    }

    url += "/validators/" + modelUrl;

    //make request here
    request("create", url, modelData, function(response) {
        callback(response.data);
    });
}

//force: true -> expect full model
//force: false -> expect only certain fields
function localValidation(schema, modelData, callback) {
    var result = {
        result : true,
        fields : {},
        failedFields : {}
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

                if(result.failedFields[field] === undefined) {
                    result.failedFields[field] = [];
                }

                result.failedFields[field].push(validationResult);

                result.result = false; //overall result
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
            //maybe use apply
            validationCallResult = schema[field].validate.call(modelData, modelData[field], runValidatorCallback);
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
 * merge failedFields of localValidation to the global failedFields object
 * @param overallResult
 * @param resultToAppend
 * @return {*}
 */
function extendFailedFields(overallResult, resultToAppend) {

    _(resultToAppend.failedFields).each(function(failedField, key) {

        if(overallResult.failedFields[key] === undefined) {
            overallResult.failedFields[key] = failedField;
        }
        else {
            overallResult.failedFields[key] = overallResult.failedFields[key].concat(failedField);
        }
    });

    return overallResult;
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
        result : false,
        failedFields : {}
    };

    async.series({
            localSharedValidation: function(cb){
                //SHARED
                localValidation(sharedSchema, modelData, function(sharedResult) {

                    overallResult.result = sharedResult.result;
                    overallResult.shared = sharedResult;

                    //maybe don't skip here
                    if(sharedResult.result === false) {
                        extendFailedFields(overallResult, sharedResult);
                    }

                    //check for second full-validation if shared worked out
                    cb(null);
                });
            },
            localValidation: function(cb){

                if(sharedSchema === localSchema) {
                    //SharedSchema and LocalSchema are identically. Skipping localSchema-Validation.
                    cb(null);
                    return;
                }

                //LOCAL
                localValidation(localSchema, modelData, function(localResult) {

                    overallResult.local = localResult;

                    if(localResult.result === false) {

                        overallResult.result = false;
                        extendFailedFields(overallResult, localResult);

                        cb(new Error("Validation failed"));
                        return;
                    }

                    cb(null);
                });
            },
            remoteValidation : function(cb) {

                if(remote === false || environment.isServer()) {
                    //needed to call the final callback
                    cb(new Error("Remote is disabled. Skipping."));
                    return;
                }

                //REMOTE
                remoteValidation(modelUrl, modelData, function(remoteResult) {

                    if(remoteResult.result === false) {
                        overallResult.result = false;
                        extendFailedFields(overallResult, remoteResult);
                    }

                    overallResult.remote = remoteResult;

                    cb();
                });
            }
        },
        function(err) {
            callback(overallResult);
        });
}


exports.localValidation = localValidation;
exports.validate = validate;
exports.remoteValidation = remoteValidation;
