"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path"),
    middler = require("middler"),
    Request = require("../../../lib/server/request/Request.class.js"),
    config = require("../../../lib/shared/config"),
    router = require("../../../lib/server/router.js");

describe("handleRequest", function() {

    var handleRequest,
        routeHandler;

    beforeEach(function() {

        router.set(middler());

        routeHandler = router.get();

        routeHandler.on("error", function(err, req, res) {

            res.end({ status : "error", message : err.message, data : {} });
        });

        handleRequest = require("../../../lib/server/request/handleRequest.js");

    });

    describe("#Services Request", function() {

        function runServiceMock(req, res, next) {
            next();
        }

        function sanitizeDataMock(req, res, next) {
            next();
        }

        var middlewareMock = [
            function a(req, res, next) {
                next();
            },
            function b(req, res,  next) {
                next();
            }
        ];


        it("should handle the request and return without an error if all middleware worked fine", function(done) {

            routeHandler.add("post", "/services/*", middlewareMock);
            routeHandler.add(["post", "put", "delete", "get"], "/services/*", runServiceMock);

            var req = new Request("create", "/services/blogPost", { da : "ta" });

            handleRequest(req, function(err, resReq, resRes) {
                expect(err).to.be(null);
                expect(resReq).to.eql(req);
                expect(resRes).not.to.be("undefined");
                done();
            });
        });

        it("should end the request and return an error if a middleware failed", function(done) {

            var middlewareMock = [
                function a(req, res, next) {
                    next(new Error("middleware a failed"));
                },
                function b(req, res,  next) {
                    next(null);
                }
            ];

            routeHandler.add(["post", "put", "delete", "get"], "/services/*", middlewareMock);
            routeHandler.add(["post", "put", "delete", "get"], "/services/*", runServiceMock);

            var req = new Request("create", "/services/blogPost", {});

            handleRequest(req, function(err, resReq, res) {
                expect(res.getStatus()).to.be("error");
                expect(res.getErrorMessage()).to.contain("middleware a failed");
                expect(resReq).to.eql(req);
                done();
            });
        });
    });

    /*
    //check this test
    //invalid request should not pass thru but happens if they do?
    //default should be an error i guess..
    describe("#Invalid Requests", function() {

        var handleRequest;

        beforeEach(function() {
            handleRequest = rewire("../../../lib/server/request/handleRequest.js");
        });

        it("should end the request if the type is not allowed", function(done) {

            var req = new Request("create", "/whatever/blogPost", {});

            req.getType = function() {
                return "unsupportedType";
            };

            handleRequest(req, function(err, resReq, resRes) {
                console.log(resRes.getResBody());
                expect(err).to.be.an(Error);
                done();
            });
        });
    });
    //*/

});