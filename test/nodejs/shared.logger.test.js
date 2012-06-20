"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    serverLogger = rewire("../lib/shared/logger.js"),
    clientLogger = require("../../lib/client/logger.client.js");

describe("Logger", function() {

    describe("#onClient", function() {

        var logger = clientLogger;

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

        var logger = serverLogger;

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
});