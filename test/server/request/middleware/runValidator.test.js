"use strict";

"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path");

nodeclass.registerExtension();

var Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js");

nodeclass.stdout = function() {
    //No output in test mode
};

describe("runValidator", function(){

    var runValidator;

    function validateTitle(val) {
        if(val.length >= 2) {
            return true;
        }
        return "toShort";
    }

    var schemasMock = {
        getSchema : function(schemaPath) {
            if(schemaPath === "test") {
                return {
                    "title" : { type : String, validate : validateTitle },
                    "creator" : { type : String, required : true }
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
                    "creator" : "octo"
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
                expect(response.getStatusCode()).to.be(500);
                expect(response.getData()).to.be.an("object");
                expect(resultObj.result).to.be(false);
                expect(resultObj.server.fields.title).to.be("toShort");
                done();
            });
        });

        it("should end the request and set the response-fields if no validator was found", function (done) {
            var method = "create",
                path = "/validators/nonExistentValidatorPath/",
                data = {
                    "title" : "my test title",
                    "creator" : "octo"
                };

            var request = new Request(method, path, data),
                response = new Response();

            runValidator(request, response, function(err) {
                expect(err.message).to.contain("No validator found for Model 'nonExistentValidatorPath'");
                done();

            });
        });

    });
});