"use strict";

var expect = require("expect.js");

var applyMiddleware = require("../../lib/server/applyMiddleware.js");

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
            res = {};

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
            res = {};

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            done();
        });
    });

    it("should reach the final callback", function (done) {

        var req = {},
            res = {};

        applyMiddleware([mw1, mw2, mw3], req, res, function(err) {
            expect(err).to.be(null);
            done();
        });
    });
});