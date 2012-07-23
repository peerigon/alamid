"use strict";

var expect = require("expect.js");

var validateModule = require("../../lib/shared/validate.js"),
    validate = validateModule.validate,
    localValidation = validateModule.localValidation,
    testSchema = require("./Model/schemas/OctocatSchema.js"),
    clientSchema = require("./Model/schemas/OctocatSchema.client.js"),
    serverSchema = require("./Model/schemas/OctocatSchema.server.js"),
    sharedSchema = testSchema;

describe("validate", function () {

    describe("localValidation", function() {

        var testModel;

        beforeEach(function() {
            testModel = {
                name : "SuperCat",
                age : 12,
                location : "Moon"
            };
        });


        it("should apply the validators and succeed with the default model data", function (done) {
            localValidation(testSchema, testModel, function(result) {
                expect(result.result).to.be(true);
                expect(result.fields.name).to.be(true);
                expect(result.fields.age).to.be(true);
                done();
            });
        });

        it("should fail if some fields are wrong", function(done) {
            testModel.age = 120;

            localValidation(testSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be(true);
                expect(result.fields.age).to.be(false);
                done();
            });
        });

        it("should fail if some fields are wrong", function(done) {
            testModel.name = null;

            localValidation(testSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                //expect(result.fields.name).to.be(false);
                expect(result.fields.age).to.be(true);
                done();
            });
        });

        it("should validate the default validators (i.e. required)", function(done) {
            delete testModel.name;
            delete testModel.age;

            localValidation(testSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be("required");
                //expect(result.fields.age).to.be("required");
                done();
            });
        });
    });

    describe("validate", function() {

        var testModel;

        beforeEach(function() {
            testModel = {
                name : "SuperCat",
                age : 12,
                location : "Moon"
            };
        });

        it("should validate shared schema and localSchema if sharedSchema passed first", function(done) {
            validate(sharedSchema, serverSchema, testModel, true, function(result) {
                expect(result.result).to.be(true);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(true);
                done();
            });
        });

        it("should not have the right result", function(done) {
            testModel.age = 99;
            validate(sharedSchema, serverSchema, testModel, true, function(result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(false);
                expect(result.local.fields.age).to.be(false);
                done();
            });
        });
        it("should not run the localValidation if the shared validation failed", function(done) {
            testModel.age = 102;
            validate(sharedSchema, serverSchema, testModel, true, function(result) {
                expect(result.result).to.be(false);
                expect(result.shared.fields.age).to.be(false);
                expect(result.shared.result).to.be(false);
                expect(result.local).to.be(undefined);
                done();
            });
        });
    });
});