"use strict";

var expect = require("expect.js"),
    ConfigSanitizer = require("../lib/core/config/ConfigSanitizer.class.js");

describe("ConfigSanitizer", function () {
    var instance,
        config;

    function setup(config_) {
        config = config_;
        instance = new ConfigSanitizer(config);
    }

    function expectLog(string, done) {
        instance.logger = function (log) {
            expect(string).to.be(log);
            done();
        };
    }

    describe("#port", function () {
        it("should cast strings to numbers", function () {
            setup({
                port: "1234"
            });
            instance.port();
            expect(config.port).to.be(1234);
        });
        it("should log an error when casting doesnt work", function (done) {
            setup({
                port: "this will be NaN"
            });
            expectLog("Error with your config: port must be a number", done);
            instance.port();
        });
    });
});