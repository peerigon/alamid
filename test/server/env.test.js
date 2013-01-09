"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    env = require("../../lib/server/env.server.js");

describe("env", function () {
    describe(".isClient()", function () {
        it("should return false", function () {
            expect(env.isClient()).to.be(false);
        });
    });
    describe(".isServer()", function () {
        it("should return true", function () {
            expect(env.isServer()).to.be(true);
        });
    });
});