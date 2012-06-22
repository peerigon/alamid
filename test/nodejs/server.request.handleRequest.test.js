"use strict";

require("./testHelpers/compileTestAlamid");

var expect = require("expect.js"),
    rewire = require("rewire"),
    Request = require("../../compiled/server/request/Request.class.js"),
    handleRequest = rewire("../../compiled/server/request/handleRequest.js");

describe("handleRequest", function() {

    describe("#services Request", function() {

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

        handleRequest.__set__("getMiddleware", getMiddlewareMock);
        var req = new Request("create", "/services/blogPost", {});

        handleRequest(req, function(err, resReq, resRes) {

        });
    });
});
