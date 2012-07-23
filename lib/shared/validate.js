"use strict";

var async = require("async"),
    log = require("./logger").get("shared");
var config = require("./config.js"),
    alamidValidators = require("./helpers/alamidValidators.js");

function remoteValidation(url, modelData, callback) {
    //make request here
    if(config.isServer === true) {
        throw new Error("(alamid) You cannot call remoteValidation on the server");
    }
}

//force: true -> expect full model
//force: false -> expect only certain fields
function localValidation(schema, modelData, callback) {
    var field,
        result = {
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
        //check for required
        if(schema[field].required === true) {
            if(alamidValidators.checkRequired(modelData[field]) !== true) {
                runValidatorCallback("required");
                fieldValidationDoneCallback();
                return;
            }
        }

        //ADD ENUM here

        //ADD MIN/MAX here

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

function validate(sharedSchema, localSchema, modelData, fullValidation, callback) {

    var overallResult = {
        result : false
    };

    localValidation(sharedSchema, modelData, function(sharedResult) {
        overallResult.result = sharedResult.result;
        overallResult.shared = sharedResult;

        //check for second full-validation if shared worked out
        if(fullValidation && sharedResult.result !== false) {
            localValidation(localSchema, modelData, function(localResult) {
                overallResult.result = localResult.result;
                overallResult.local = localResult;

                /*
                if(localResult.result === true && config.isClient) {
                    //do remote validation here!
                }
                else {
                    callback(overallResult);
                }
                */

                callback(overallResult);
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

/*
- immer shared durchlaufen lassen
- scrict mode default on, optional mit false aus machen
- auf client: shared + client + server (nur shared felder)
- auf server: shared + server


 */
