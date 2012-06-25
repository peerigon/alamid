"use strict";

require("./testHelpers/compileTestAlamid");

var expect = require("expect.js"),
    rewire = require("rewire"),
    Request = require("../../compiled/server/request/Request.class.js"),
    handleRequest = rewire("../../compiled/server/request/handleRequest.js");

describe("handleRequest", function() {

    describe("#Services Request", function() {

        before(function() {
            function runServiceMock(req, res, next) {
                next();
            }

            function getMiddlewareMock(reqType, reqMethod, reqPath) {

                return [
                    function a(req, res, next) {
                        next();
                    },
                    function b(req, res,  next) {
                        next();
                    }
                ];
            }

            function runServiceMock(req, res, next) {
                next();
            }

            handleRequest.__set__("getMiddleware", getMiddlewareMock);
            handleRequest.__set__("runService", runServiceMock);
        });

        it("should handle the request and return without an error if all middlewares worked fine", function(done) {
            var req = new Request("create", "/services/blogPost", {});

            handleRequest(req, function(err, resReq, resRes) {
                expect(err).to.be(null);
                expect(resReq).to.eql(req);
                expect(resRes).not.to.be("undefined");
                done();
            });
        });
    });

    it("should handle the request and return without an error if all middlewares worked fine", function(done) {

        function getMiddlewareMock(reqType, reqMethod, reqPath) {

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

        handleRequest(req, function(err, resReq, resRes) {
            expect(err.message).to.contain("middleware a failed");
            expect(resReq).to.eql(req);
            expect(resRes).not.to.be("undefined");
            done();
        });
    });
});
