"use strict";

var expect = require("expect.js");

var applyMiddleware = require("../../lib/server/applyMiddleware.js"),
    Response = require("../../lib/server/request/Response.class.js");

describe("applyMiddleware", function () {

    var mw1, mw2, mw3;

    beforeEach(function() {

        mw1 = function (req, res, next) {
            next();
        };

        mw2 = function(req, res, next) {
            next();
        };

        mw3 = function(req, res, next) {
            next();
        };
    });

    it("should pass the functions thru", function (done) {
        function mw3(req, res, next) {
            expect(req).not.to.be(undefined);
            expect(res).not.to.be(undefined);
            done();
        }

        var req = {},
            res = new Response();

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            done(new Error("Final error-callback should not be called"));
        });
    });

    it("should call the final error-callback on error", function (done) {

        mw3 = function(req, res, next) {
            done(new Error("mw3 should not be reached"));
        };

        mw2 = function(req, res, next) {
            next(new Error("Random Error"));
        };

        var req = {},
            res = new Response();

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            done();
        });
    });

    it("should reach the final callback", function (done) {

        var req = {},
            res = new Response();

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            expect(err).to.be(null);
            done();
        });
    });

    it("should end the request if res.end was called", function (done) {

        var resData = { status : "success", data : { da : "ta" }};

        mw3 = function(req, res, next) {
            done(new Error("mw3 should not be reached"));
        };

        mw2 = function(req, res, next) {
            res.end(resData);
        };

        var req = {},
            res = new Response();

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            expect(res.getResBody()).to.eql({ status : "success", data : { da : "ta" }});
            done();
        });
    });

    it("should return an error if next was called after res.end", function (done) {

        var resData = { status : "success", data : { da : "ta" }};

        mw3 = function(req, res, next) {
            done(new Error("mw3 should not be reached"));
        };

        mw2 = function nextingAfterResMiddleware(req, res, next) {
            res.end(resData);
            next();
        };

        var req = {},
            res = new Response();

        expect(function() {
            applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
                expect(res.getResBody()).to.eql({ status : "success", data : { da : "ta" }});
                expect(err).not.to.be(null);
                done();
            });
        }).to.throwError();
    });

});