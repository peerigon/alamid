"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    env = require("../../lib/client/env.client.js");

describe("env", function () {
    describe(".isClient()", function () {
        it("should return true", function () {
            expect(env.isClient()).to.be(true);
        });
    });
    describe(".isServer()", function () {
        it("should return false", function () {
            expect(env.isServer()).to.be(false);
        });
    });
});