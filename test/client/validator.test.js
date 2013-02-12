"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

describe("validator", function () {

    var validator,
        validate,
        localValidation,
        sharedSchema;

    before(function () {

        sharedSchema = require("../shared/Model/schemas/OctocatSchema.js");
        validator = rewire("../../lib/shared/validator.js");

        validator.__set__("routes", {
            validators : "validators/"
        });

        validate = validator.validate;
        localValidation = validator.localValidation;
    });

    describe("Client", function () {

        var testModel,
            modelUrl;

        var clientSchema = require("../shared/Model/schemas/OctocatSchema.client.js");

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