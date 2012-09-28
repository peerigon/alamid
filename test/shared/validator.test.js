"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

var validator = require("../../lib/shared/validator.js"),
    validate = validator.validate,
    localValidation = validator.localValidation;

describe("validator", function () {

    describe("Default Validators", function() {

        var testModel,
            pandaSchema = require("./Model/schemas/PandaSchema.js");

        beforeEach(function() {
            testModel = {
                name : "pandaa",
                mood : "happy",
                pooCount : 11
            };
        });

        it("should check required fields", function (done) {
            delete testModel.name;

            localValidation(pandaSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be("required");
                expect(result.fields.mood).to.be(true);
                expect(result.fields.pooCount).to.be(true);
                done();
            });

        });

        it("should check enum fields", function (done) {
            testModel.mood = "whatever";

            localValidation(pandaSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be(true);
                expect(result.fields.mood).to.be("enum");
                expect(result.fields.pooCount).to.be(true);
                done();
            });
        });

        it("should check min fields", function (done) {
            testModel.pooCount = 1;

            localValidation(pandaSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be(true);
                expect(result.fields.mood).to.be(true);
                expect(result.fields.pooCount).to.be("min");
                done();
            });
        });

        it("should check max fields", function (done) {
            testModel.pooCount = 101;

            localValidation(pandaSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be(true);
                expect(result.fields.mood).to.be(true);
                expect(result.fields.pooCount).to.be("max");
                done();
            });
        });
    });

    describe("localValidation", function() {

        var sharedSchema = require("./Model/schemas/OctocatSchema.js");

        var testModel;

        beforeEach(function() {
            testModel = {
                name : "SuperCat",
                age : 12,
                location : "Moon"
            };
        });

        it("should apply the validators and succeed with the default model data", function (done) {
            localValidation(sharedSchema, testModel, function(result) {
                expect(result.result).to.be(true);
                expect(result.fields.name).to.be(true);
                expect(result.fields.age).to.be(true);
                done();
            });
        });

        it("should fail if some fields are wrong", function(done) {
            testModel.age = 120;

            localValidation(sharedSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be(true);
                expect(result.fields.age).to.be("tooOld-shared");
                done();
            });
        });

        it("should fail if some fields are wrong", function(done) {
            testModel.name = null;

            localValidation(sharedSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                //expect(result.fields.name).to.be(false);
                expect(result.fields.age).to.be(true);
                done();
            });
        });

        it("should validate the default validators (i.e. required)", function(done) {
            delete testModel.name;
            delete testModel.age;

            localValidation(sharedSchema, testModel, function(result) {
                expect(result.result).to.be(false);
                expect(result.fields.name).to.be("required");
                expect(result.fields.age).to.be(true);
                done();
            });
        });
    });

    describe("validate", function() {

        var sharedSchema = require("./Model/schemas/OctocatSchema.js");

        describe("Server", function() {

            var testModel,
                modelUrl,
                validate;

            var serverSchema = require("./Model/schemas/OctocatSchema.server.js");

            before(function() {
                validator = rewire("../../lib/shared/validator.js");
                validator.__set__("environment", {
                    isClient : function() { return false; },
                    isServer : function() { return true; }
                });
                validate = validator.validate;
            });

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
                    expect(result.local.fields.age).to.contain("tooOld");
                    done();
                });
            });

            it("should return all failed fields at the top-level of result", function(done) {
                testModel.age = 102;
                validate(sharedSchema, serverSchema, modelUrl, testModel, true, function(result) {

                    expect(result.result).to.be(false);
                    expect(result.shared.failedFields.age[0]).to.be("tooOld-shared");
                    expect(result.shared.fields.age).to.be("tooOld-shared");
                    expect(result.shared.result).to.be(false);

                    //TODO resolve strange bug with server-schema being replace with client schema in browser
                    //add check for tooOld-server
                    expect(result.local.failedFields.age[0]).to.contain("tooOld");
                    expect(result.local.fields.age).to.contain("tooOld");
                    //also check for "tooOld-server" if bug above is fixed
                    expect(result.failedFields.age).to.contain("tooOld-shared");

                    done();
                });
            });

            it("should not run local & shared validation if the schemas are identical", function(done) {
                testModel.age = 102;
                validate(sharedSchema, sharedSchema, modelUrl, testModel, true, function(result) {

                    expect(result.result).to.be(false);
                    expect(result.shared.failedFields.age[0]).to.be("tooOld-shared");
                    expect(result.shared.fields.age).to.be("tooOld-shared");
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

            var clientSchema = require("./Model/schemas/OctocatSchema.client.js");

            before(function() {
                validator = rewire("../../lib/shared/validator.js");
                validator.__set__("environment", {
                    isClient : function() { return true; },
                    isServer : function() { return false; }
                });
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
                    callback({
                        result : true,
                        failedFields : {

                        },
                        shared : {
                            result : true
                        },
                        local : {
                            result : true
                        }
                    });
                };

                validator.__set__("remoteValidation", remoteValidationMock);

                validator.validate(sharedSchema, clientSchema, modelUrl, testModel, true, function(result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    expect(result.remote.result).to.be(true);
                    done();
                });
            });

            it("should not call the remote validator on client if remoteValidaton is disabled", function(done) {
                var remoteValidationMock = function(schema, modelData, callback) {
                    callback({
                        result : true,
                        shared : {
                            result : true
                        },
                        local : {
                            result : true
                        }
                    });
                };

                validator.__set__("remoteValidation", remoteValidationMock);

                validator.validate(sharedSchema, clientSchema, modelUrl, testModel, false, function(result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    expect(result.remote).to.be(undefined);
                    done();
                });
            });
        });
    });
});