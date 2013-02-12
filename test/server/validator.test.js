"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

describe("validate", function () {

    var validator,
        validate,
        localValidation,
        sharedSchema;

    before(function () {
        sharedSchema = require("../shared/Model/schemas/OctocatSchema.js");
        validator = rewire("../../lib/shared/validator.js");
        validate = validator.validate;
        localValidation = validator.localValidation;
    });

    describe("Server", function () {

        var testModel,
            modelUrl;

        var serverSchema = require("../shared/Model/schemas/OctocatSchema.server.js");

        beforeEach(function () {
            testModel = {
                name : "SuperCat",
                age : 12,
                location : "Moon"
            };
            modelUrl = "test";
        });

        it("should validate shared schema and localSchema if sharedSchema passed first", function (done) {
            validate(sharedSchema, serverSchema, modelUrl, testModel, true, function (result) {
                expect(result.result).to.be(true);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(true);
                done();
            });
        });

        it("should not call the remote validator on the server if sharedSchema passed first", function (done) {
            validate(sharedSchema, serverSchema, modelUrl, testModel, true, function (result) {
                expect(result.result).to.be(true);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(true);
                expect(result.remote).to.be(undefined);
                done();
            });
        });

        it("should not pass the validator if local validation fails", function (done) {
            testModel.age = 99;
            validate(sharedSchema, serverSchema, modelUrl, testModel, true, function (result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(false);
                expect(result.local.failedFields.age[0]).to.contain("tooOld");
                expect(result.failedFields.age[0]).to.contain("tooOld");
                done();
            });
        });

        it("should not pass the validator if shared validation fails", function (done) {
            testModel.location = "";
            validate(sharedSchema, serverSchema, modelUrl, testModel, true, function (result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(false);
                expect(result.local.result).to.be(true);
                expect(result.shared.failedFields.location).to.contain(false);
                expect(result.local.failedFields).not.to.contain("location");
                done();
            });
        });

        it("should return all failed fields at the top-level of result", function (done) {
            testModel.age = 102;
            validate(sharedSchema, serverSchema, modelUrl, testModel, true, function (result) {

                expect(result.result).to.be(false);
                expect(result.shared.failedFields.age[0]).to.be("tooOld-shared");
                expect(result.shared.result).to.be(false);
                expect(result.local.failedFields.age[0]).to.contain("tooOld-server");
                expect(result.failedFields.age).to.contain("tooOld-server");

                done();
            });
        });

        it("should not run local & shared validation if the schemas are identical", function (done) {
            testModel.age = 102;
            validate(sharedSchema, sharedSchema, modelUrl, testModel, true, function (result) {

                expect(result.result).to.be(false);
                expect(result.shared.failedFields.age[0]).to.be("tooOld-shared");
                expect(result.shared.result).to.be(false);
                expect(result.local).to.be(undefined);

                done();
            });
        });
    });
});