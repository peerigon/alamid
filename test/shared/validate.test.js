"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

var validator = require("../../lib/shared/validator.js"),
    validate = validator.validate,
    localValidation = validator.localValidation,
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

        describe("Server", function() {

            var testModel,
                modelUrl;

            beforeEach(function() {
                testModel = {
                    name : "SuperCat",
                    age : 12,
                    location : "Moon"
                };
                modelUrl = "test";
            });

            it("should validate shared schema and localSchema if sharedSchema passed first", function(done) {
                validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    done();
                });
            });

            it("should not call the remote validator on the server if sharedSchema passed first", function(done) {
                validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    expect(result.remote).to.be(undefined);
                    done();
                });
            });

            it("should not pass the validator if local validation fails", function(done) {
                testModel.age = 99;
                validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(false);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(false);
                    expect(result.local.fields.age).to.be(false);
                    done();
                });
            });

            it("should not run the localValidation if the shared validation failed", function(done) {
                testModel.age = 102;
                validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(false);
                    expect(result.shared.fields.age).to.be(false);
                    expect(result.shared.result).to.be(false);
                    expect(result.local).to.be(undefined);
                    done();
                });
            });
        });

        describe("Client", function() {

            var validator,
                testModel,
                modelUrl;

            before(function() {
                validator = rewire(path.resolve(__dirname, "../../lib/shared/validator.js"), false);
                validator.__set__("config", { isClient : true });
            });

            beforeEach(function(){
                modelUrl = "test";
                testModel = {
                    name : "Octocat",
                    age : 12,
                    location : "Anywhere"
                };
            });

            it("should call the remote validator on client if shared-validation and local validation worked out", function(done) {
                var remoteValidationMock = function(schema, modelData, callback) {
                    callback({ result : true, shared : { result : true}, local : { result : true}});
                };

                validator.__set__("remoteValidation", remoteValidationMock);

                validator.validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    expect(result.remote.result).to.be(true);
                    done();
                });
            });
        });
    });
});