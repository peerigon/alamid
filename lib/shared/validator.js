"use strict";

var async = require("async");

function validator(schema, modelData, validationLocation, callback) {

    var path,
        result = {
            result : "false",
            "server" : {
                result : false,
                fields : {}
            },
            "client" : {
                result : false,
                fields : {}
            }
        };

    function runValidator(path, pathValidatorDoneCallback) {

        var validationCallResult;

        function runValidatorCallback(validationResult) {

            if (validationCallResult.called) {
                throw new Error("(alamid) Function '" +
                    Object.prototype.toString.call(schema[path].validator) +
                    "' returns multiple values");
            }

            validationCallResult.called = true;
            //set the result
            result[path] = validationResult;
        }

        validationCallResult = schema[path].validate.call(null, modelData[path], runValidatorCallback);

        if (validationCallResult !== undefined) {
            runValidatorCallback(validationCallResult);
        }

        pathValidatorDoneCallback();
    }

    var validatorsToRun = [];

    for (path in schema) {
        if (schema.hasOwnProperty(path)) {
            if(schema[path].validate !== undefined) {
                //runValidator(path);
                validatorsToRun.push(path);
            }
        }
    }

    console.log("validatorsToRun",validatorsToRun);

    async.forEach(validatorsToRun, runValidator, function(err){

        if(err) {
            throw err;
        }

        callback(result);
    });
}

module.exports = validator;