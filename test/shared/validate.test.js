"use strict";

var expect = require("expect.js");

var validator = require("../../lib/shared/validate.js"),
    testSchema = require("./Model/schemas/OctocatSchema.js");

describe("validate", function () {

    var testModel;

    before(function() {
        testModel = {
            name : "SuperCat",
            age : 12,
            location : "Moon"
        };
    });

    it("should apply the validators and succed with the default model data", function () {
        validator(testSchema, testModel, { client : true, server : true }, function(result) {
            expect(result.result).to.be(true);
            expect(result.server.result).to.be(true);
            expect(result.server.fields.name).to.be(true);
            expect(result.server.fields.age).to.be(true);
        });
    });

    it("should apply the validators and succed with the default model data", function () {

        testModel.age = 120;

        validator(testSchema, testModel, { client : true, server : true }, function(result) {
            expect(result.result).to.be(false);
            expect(result.server.result).to.be(false);
            expect(result.server.fields.name).to.be(true);
            expect(result.server.fields.age).to.be(false);
        });
    });

});