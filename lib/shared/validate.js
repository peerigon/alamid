"use strict";


var async = require("async");
var config = require("./config.js"),
    alamidValidators = require("./helpers/alamidValidators.js");

function validate(schema, modelData, validationType, callback) {

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

    function runFieldValidation(path, fieldValidationDoneCallback) {

        var validationCallResult = {};

        function runValidatorCallback(validationResult) {

            if (validationCallResult.called) {
                throw new Error("(alamid) Function '" +
                    Object.prototype.toString.call(null, schema[path].validator) +
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

        //check for required
        if(schema[path].required === true) {
            if(alamidValidators.checkRequired(modelData[path]) !== true) {
                runValidatorCallback("required");
                fieldValidationDoneCallback();
                return;
            }
        }

        validationCallResult = schema[path].validate.call(null, modelData[path], runValidatorCallback);

        if (validationCallResult !== undefined) {
            runValidatorCallback(validationCallResult);
        }

        fieldValidationDoneCallback();
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
        if(validationType.server === true) {
            //make request here...

            //we need the path here!
            //must be passed via model
            //does the model know it?

            localValidation(validatorsToRun, function() {
                callback(result);
            });
        }
    }
    else {
        activeLocation = "server";
        if(validationType.client === true) {

            localValidation(validatorsToRun, function() {
                callback(result);
                  //this case doesn't make sense at all
                  //require the suitable model/schema here
                  //call the validate method!

            });
        }
    }


}

module.exports = validate;