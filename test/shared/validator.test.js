"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

var validator, validate, localValidation;

describe("validator", function () {

    before(function () {
        validator = require("../../lib/shared/validator.js");
        validate = validator.validate;
        localValidation = validator.localValidation;
    });

    describe("Default Validators", function () {

        var testModel,
            pandaSchema = require("./Model/schemas/PandaSchema.js");

        beforeEach(function () {
            testModel = {
                name : "pandaa",
                mood : "happy",
                pooCount : 11
            };
        });

        it("should check required fields", function (done) {
            delete testModel.name;

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.name).to.contain("required");
                done();
            });

        });

        it("should check enum fields", function (done) {

            testModel.mood = "whatever";

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.mood).to.contain("enum");
                done();
            });
        });

        it("should check min fields", function (done) {
            testModel.pooCount = 1;

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.pooCount).to.contain("min");
                expect(result.failedFields).not.to.contain(["mood", "name"]);
                done();
            });
        });

        it("should check max fields", function (done) {
            testModel.pooCount = 101;

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.pooCount).to.contain("max");
                expect(result.failedFields).not.to.contain(["mood", "name"]);
                done();
            });
        });
    });

    describe("Custom validators with many validators per field as array", function () {

        var testModel,
            pandaSchema = require("./Model/schemas/PandaSchema.js");

        beforeEach(function () {
            testModel = {
                name : "pandaaaaaa",
                password : "thatsmypassdude",
                pooCount : 12,
                mood : "crazy"
            };
        });

        it("should pass if name and password are set", function (done) {

            pandaSchema.name.validate = [
                function validator1(name) {
                    return "val1Failed";
                },
                function validator2(name) {
                    return "val2Failed";
                }
            ];

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.name).to.contain("val1Failed");
                expect(result.failedFields.name).to.contain("val2Failed");
                done();
            });
        });
    });

    describe("Custom validators with references", function () {

        var testModel,
            pandaSchema = require("./Model/schemas/PandaSchema.js");

        beforeEach(function () {
            testModel = {
                name : "pandaaaaaa",
                password : "thatsmypassdude",
                pooCount : 12,
                mood : "crazy"
            };
        });

        before(function () {

            pandaSchema.name.validate = function (name) {

                if (!name) {
                    return "required";
                }

                //you also need a password if name is set
                if (this.password === undefined) {
                    return "password-required";
                }

                return true;
            };
        });

        it("should pass if name and password are set", function (done) {

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(true);
                done();
            });
        });

        it("should fail because password has to be set, if name is set", function (done) {

            delete testModel.password;

            localValidation(pandaSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.name).to.contain("password-required");
                done();
            });
        });

    });

    describe("Sync and Async Validators", function () {

        var testModel,
            surfSchema = require("./Model/schemas/SurfSchema.js");

        beforeEach(function () {
            testModel = {
                name : "nameWithManyChars",
                fun : true
            };
        });

        it("should pass sync and async validator", function (done) {

            localValidation(surfSchema, testModel, function (result) {
                expect(result.result).to.be(true);
                done();
            });
        });

        it("should fail the sync validator if name is to short", function (done) {

            testModel.name = "sh";

            localValidation(surfSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.name).to.contain(false);
                done();
            });
        });

        it("should fail the async validator if surf was no fun", function (done) {

            testModel.name = "loooooong";
            testModel.fun = false;

            localValidation(surfSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields.fun).to.contain(false);
                done();
            });
        });
    });

    describe("localValidation", function () {

        var sharedSchema = require("./Model/schemas/OctocatSchema.js");

        var testModel;

        beforeEach(function () {
            testModel = {
                name : "SuperCat",
                age : 12,
                location : "Moon"
            };
        });

        it("should apply the validators and succeed with the default model data", function (done) {
            localValidation(sharedSchema, testModel, function (result) {
                expect(result.result).to.be(true);
                expect(result.failedFields).not.to.contain(["name", "age"]);
                done();
            });
        });

        it("should fail if some fields are wrong", function (done) {
            testModel.age = 120;

            localValidation(sharedSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields).not.to.contain(["name"]);
                expect(result.failedFields.age).to.contain("tooOld-shared");
                done();
            });
        });

        it("should fail if some fields are wrong", function (done) {
            testModel.name = null;

            localValidation(sharedSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields).not.to.contain(["age"]);
                done();
            });
        });

        it("should validate the default validators (i.e. required)", function (done) {
            delete testModel.name;
            delete testModel.age;

            localValidation(sharedSchema, testModel, function (result) {
                expect(result.result).to.be(false);
                expect(result.failedFields).not.to.contain(["age"]);
                expect(result.failedFields.name).to.contain("required");
                done();
            });
        });
    });

    describe("validate", function () {

        var sharedSchema = require("./Model/schemas/OctocatSchema.js");

        describe("Server", function () {

            var testModel,
                modelUrl,
                validate,
                validator;

            var serverSchema = require("./Model/schemas/OctocatSchema.server.js");

            before(function () {
                validator = require("../../lib/shared/validator.js");
                validator = rewire("../../lib/shared/validator.js");
                validator.__set__("env", {
                    isClient : function () {
                        return false;
                    },
                    isServer : function () {
                        return true;
                    }
                });
                validate = validator.validate;
            });

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

                    //TODO resolve strange bug with server-schema being replace with client schema in browser
                    //add check for tooOld-server
                    expect(result.local.failedFields.age[0]).to.contain("tooOld");

                    //also check for "tooOld-server" if bug above is fixed
                    expect(result.failedFields.age).to.contain("tooOld-shared");

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

        describe("Client", function () {

            var validator,
                testModel,
                modelUrl;

            var clientSchema = require("./Model/schemas/OctocatSchema.client.js");

            before(function () {
                validator = rewire("../../lib/shared/validator.js");
                validator.__set__("env", {
                    isClient : function () {
                        return true;
                    },
                    isServer : function () {
                        return false;
                    }
                });
            });

            beforeEach(function () {
                modelUrl = "test";
                testModel = {
                    name : "Octocat",
                    age : 12,
                    location : "Anywhere"
                };
            });

            it("should call the remote validator on client if shared-validation and local validation worked out", function (done) {
                var remoteValidationMock = function (schema, modelData, callback) {
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

                validator.validate(sharedSchema, clientSchema, modelUrl, testModel, true, function (result) {
                    expect(result.result).to.be(true);
                    expect(result.shared.result).to.be(true);
                    expect(result.local.result).to.be(true);
                    expect(result.remote.result).to.be(true);
                    done();
                });
            });

            it("should not call the remote validator on client if remoteValidaton is disabled", function (done) {
                var remoteValidationMock = function (schema, modelData, callback) {
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

                validator.validate(sharedSchema, clientSchema, modelUrl, testModel, false, function (result) {
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