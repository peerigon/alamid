"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

describe("validator", function () {

    var validator, validate, localValidation;

    before(function () {

        validator = rewire("../../lib/shared/validator.js");
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
});