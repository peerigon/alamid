"use strict";

var expect = require("expect.js"),
    clientLogger = require("../../lib/client/logger.client.js"),
    sharedLogger = require("../../lib/shared/logger.js");


describe("Logger", function() {

    var logger;

    /*
    describe("#onClient", function() {

        beforeEach(function () {
            logger = clientLogger;
        });

        it("should return the different log-types", function() {
            expect(logger.get("server")).not.to.be(undefined);
            expect(logger.get("core")).not.to.be(undefined);
            expect(logger.get("build")).not.to.be(undefined);
        });

        it("should have methods for the log-levels", function() {
            var log = logger.get("server");
            expect(log.info).to.be.a("function");
            expect(log.warn).to.be.a("function");
            expect(log.error).to.be.a("function");
            expect(log.debug).to.be.a("function");
            expect(log.silly).to.be.a("function");
            expect(log.verbose).to.be.a("function");
            expect(log.bullshit).to.be(undefined);
        });
    });

    describe("#onServer", function() {

        beforeEach(function () {
            logger = sharedLogger;
        });

        it("should return the different log-types", function() {
            expect(logger.get("server")).not.to.be(undefined);
            expect(logger.get("core")).not.to.be(undefined);
            expect(logger.get("build")).not.to.be(undefined);
        });

        it("should have methods for the log-levels", function() {
            var log = logger.get("server");
            expect(log.info).to.be.a("function");
            expect(log.warn).to.be.a("function");
            expect(log.error).to.be.a("function");
            expect(log.debug).to.be.a("function");
            expect(log.silly).to.be.a("function");
            expect(log.verbose).to.be.a("function");
            expect(log.bullshit).to.be(undefined);
        });
    });
    */

});