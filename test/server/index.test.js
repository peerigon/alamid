"use strict";

var expect = require("expect.js"),
    alamid = require("../../lib/index.js"),
    Server = require("../../lib/server/Server.class.js");

describe("index.js (server)", function () {
    it("should export Server", function () {
        expect(alamid.Server).to.be(Server);
    });
});