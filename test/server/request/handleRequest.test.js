"use strict";

require("nodeclass").registerExtension();

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path"),
    Request = require("../../../lib/server/request/Request.class.js"),
    config = require("../../../lib/shared/config"),
    collectMiddleware = require("../../../lib/server/collectMiddleware.js"),
    middleware = require("../../../lib/server/request/middleware.js");


describe("handleRequest", function() {

    var handleRequest;

    beforeEach(function() {
        handleRequest = rewire("../../../lib/server/request/handleRequest.js", false);
    });

    describe("#Services Request", function() {

        beforeEach(function() {
            function runServiceMock(req, res, next) {
                next();
            }

            function getMiddlewareMock() {

                return [
                    function a(req, res, next) {
                        next();
                    },
                    function b(req, res,  next) {
                        next();
                    }
                ];
            }

            handleRequest.__set__("getMiddleware", getMiddlewareMock);
            handleRequest.__set__("runService", runServiceMock);
        });

        it("should handle the request and return without an error if all middleware worked fine", function(done) {
            var req = new Request("create", "/services/blogPost", { da : "ta" });

            handleRequest(req, function(err, resReq, resRes) {
                expect(err).to.be(null);
                expect(resReq).to.eql(req);
                expect(resRes).not.to.be("undefined");
                done();
            });
        });
    });

    it("should handle the request and return without an error if all middleware worked fine", function(done) {

        function getMiddlewareMock() {
            return [
                function a(req, res, next) {
                    next(new Error("middleware a failed"));
                },
                function b(req, res,  next) {
                    next(null);
                }
            ];
        }

        handleRequest.__set__("getMiddleware", getMiddlewareMock);
        var req = new Request("create", "/services/blogPost", {});

        handleRequest(req, function(err, resReq) {
            expect(err.message).to.contain("middleware a failed");
            expect(resReq).to.eql(req);
            done();
        });
    });

    describe("#Invalid Requests", function() {

        it("should end the request if the type is not allowed", function(done) {
            var req = new Request("create", "/services/blogPost", {});
            req.getType = function() {
                return "unsupportedType";
            };

            handleRequest(req, function(err) {
                expect(err).not.to.be(null);
                done();
            });
        });
    });


    describe("#Request with Middleware", function() {
        it("should run the defined middleware", function(done) {
            var mwPath = path.resolve(__dirname, "../../exampleApp/app/services/servicesMiddleware.js");

            var servicesMiddleware = collectMiddleware([], mwPath);

            middleware.setMiddleware("services", servicesMiddleware);

            handleRequest = rewire("../../../lib/server/request/handleRequest.js", false);
            handleRequest.__set__("getMiddleware", middleware.getMiddleware);

            var req = new Request("create", "/services/blog", {});

            handleRequest(req, function(err) {
                expect(req.getData()).to.eql({ fancy : true });
                expect(err).not.to.be(null);
                done();
            });
        });
    });
});
