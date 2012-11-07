"use strict";

"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

var Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js");

describe("runValidator", function(){

    var runValidator;

    function validateTitle(val) {
        if(val.length >= 2) {
            return true;
        }
        return "toShort";
    }

    function validateCreator(val) {
        if(val.length >= 5) {
            return true;
        }
        return "toShort";
    }

    var schemasMock = {
        getSchema : function(schemaPath, type) {
            if(schemaPath === "test" && type === "shared") {
                return {
                    "title" : { type : String, validate : validateTitle },
                    "creator" : { type : String, required : true }
                };
            }
            if(schemaPath === "test" && type === "server") {
                return {
                    "title" : { type : String, validate : validateTitle },
                    "creator" : { type : String, required : true, validate: validateCreator },
                    "location" : { type : String, validate : function(val) { return false; } } //should never be called
                };
            }
            return null;
        }
    };

    before(function() {
        runValidator = rewire("../../../../lib/server/request/middleware/runValidator.js", false);
        runValidator.__set__("schemas", schemasMock);
    });

    describe("Basics", function () {

        it("should return the right success-response if validator was found and applied successfully", function (done) {

            var method = "create",
                path = "/validators/test/",
                data = {
                    "title" : "my test title",
                    "creator" : "octocaaat"
                };

            var request = new Request(method, path, data),
                response = new Response();

            runValidator(request, response, function(err) {
                var resultObj = response.getData();
                expect(err).to.be(undefined);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.be.an("object");
                expect(resultObj.result).to.be(true);
                done();
            });
        });

        it("should return the an error-response if validator was found but failed", function (done) {

            var method = "create",
                path = "/validators/test/",
                data = {
                    "title" : "m", //to short
                    "creator" : "octo"
                };

            var request = new Request(method, path, data),
                response = new Response();

            runValidator(request, response, function(err) {
                var resultObj = response.getData();
                expect(err).to.be(undefined);
                expect(response.getStatus()).to.be("fail");
                expect(response.getStatusCode()).to.be(400);
                expect(response.getData()).to.be.an("object");
                expect(resultObj.result).to.be(false);
                expect(resultObj.shared.failedFields.title).to.contain("toShort");
                done();
            });
        });

        it("should validate shared and server if shared-validation passed", function (done) {

            var method = "create",
                path = "/validators/test/",
                data = {
                    "title" : "my very long title",
                    "creator" : "oc"
                };

            var request = new Request(method, path, data),
                response = new Response();

            runValidator(request, response, function(err) {
                var resultObj = response.getData();
                expect(err).to.be(undefined);
                expect(response.getStatus()).to.be("fail");
                expect(response.getStatusCode()).to.be(400);
                expect(response.getData()).to.be.an("object");
                expect(resultObj.result).to.be(false);
                expect(resultObj.shared.result).to.be(true);
                expect(resultObj.local.result).to.be(false);
                done();
            });
        });

        it("should end the request and set the response-fields if no validator was found", function (done) {
            var method = "create",
                path = "/validators/nonexistentvalidatorpath/",
                data = {
                    "title" : "my test title",
                    "creator" : "octo"
                };

            var request = new Request(method, path, data),
                response = new Response();

            runValidator(request, response, function(err) {
                expect(err.message).to.contain("for Model 'nonexistentvalidatorpath'");
                done();

            });
        });

    });
});