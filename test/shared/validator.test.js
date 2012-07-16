"use strict";

var expect = require("expect.js");

var validator = require("../../lib/shared/validator.js");

describe("validator", function () {

    var testSchema,
        testModel;

    before(function() {
        testSchema = require("./Model/schemas/OctocatSchema.js");
        testModel = {
            name : "SuperCat",
            age : 12,
            location : "Moon"
        };
    });

    it("should apply the validators and succed with the default model data", function () {
        validator(testSchema, testModel, function(result) {
            console.log("result", result);
        });
    });

    it("should apply the validators and succed with the default model data", function () {

        testModel.age = 120;

        validator(testSchema, testModel, function(result) {
            console.log("result", result);
        });
    });

});