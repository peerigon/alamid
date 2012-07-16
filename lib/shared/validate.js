"use strict";

var async = require("async");

var config = require("./config.js");

function validate(schema, modelData, validationLocation, callback) {

    var path,
        activeLocation,
        result = {
            result : true,
            "server" : {
                result : true,
                fields : {}
            },
            "client" : {
                result : true,
                fields : {}
            }
        };

    function runFieldValidation(path, fileValidationDoneCallback) {

        var validationCallResult;

        function runValidatorCallback(validationResult) {

            if (validationCallResult.called) {
                throw new Error("(alamid) Function '" +
                    Object.prototype.toString.call(schema[path].validator) +
                    "' returns multiple values");
            }

            validationCallResult.called = true;

            //set the result
            result[activeLocation].fields[path] = validationResult;

            if(validationResult !== true) {
                result[activeLocation].result = false;
                result.result = false;
            }
        }

        validationCallResult = schema[path].validate.call(null, modelData[path], runValidatorCallback);

        if (validationCallResult !== undefined) {
            runValidatorCallback(validationCallResult);
        }

        fileValidationDoneCallback();
    }

    function localValidation(validatorsToRun, localValidationCallback) {
        async.forEach(validatorsToRun, runFieldValidation, function(err){
            if(err) {
                throw err;
            }
            localValidationCallback(result);
        });
    }

    //START
    var validatorsToRun = [];

      for (path in schema) {
          if (schema.hasOwnProperty(path)) {
              if(schema[path].validate !== undefined) {
                  validatorsToRun.push(path);
              }
          }
      }


    if(config.isClient === true) {
        activeLocation = "client";
        if(validationLocation.server === true) {
            //make request here...

            localValidation(validatorsToRun, function() {
                callback(result);
            });
        }
    }
    else {
        activeLocation = "server";
        if(validationLocation.client === true) {

            localValidation(validatorsToRun, function() {
                callback(result);

                  //require the suitable model/schema here
                  //call the validate method!
            });
        }
    }


}

module.exports = validate;