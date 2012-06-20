"use strict";

var expect = require("expect.js"),
    path = require("path"),
    sanitizeConfig = require("../../lib/core/config/sanitizeConfig.js");

describe("sanitizeConfig", function () {
    var instance,
        config,
        sanitizedConfig;

    before(function () {
        sanitizeConfig.log = function () { /* do nothing. we don't want to spill the console when testing */ };
    });

    beforeEach(function () {
        config = {
            "port" : 1223,
            "appDir" : "/myDir",
            "logDir" : "/logDir"
        }
    });

    describe("#port", function () {

        it("should cast strings to numbers", function () {
            config.port = "1234";
            sanitizedConfig = sanitizeConfig(config);
            expect(sanitizedConfig.port).to.be(1234);
        });

        it("should throw an error when port has uncastable type", function () {
            config.port = "ABX";
            expect(function() { sanitizeConfig(config); }).to.throwError();
        });

        it("should throw an error when port is not set", function () {
            delete config.port;
            expect(function() { sanitizeConfig(config); }).to.throwError();
        });

        it("should throw an error when port is null", function () {
            config.port = null;
            expect(function() { sanitizeConfig(config); }).to.throwError();
        });
    });

    describe("#appDir", function () {

        it("should take the folder if passed", function () {
            sanitizedConfig = sanitizeConfig(config);

            expect(sanitizedConfig.appDir).to.contain('myDir');
        });

        it("should take the CWD if dir is not set", function () {
            delete config.appDir;
            sanitizedConfig = sanitizeConfig(config);
            expect(sanitizedConfig.appDir).to.contain(path.resolve(__dirname, "../"));
        });

        it("should add paths as object for app-dir", function(){
            expect(sanitizedConfig.paths).to.be.an("object");
        })
    });

    describe("#logDir", function () {

        it("should take the folder if passed", function () {
            sanitizedConfig = sanitizeConfig(config);
            expect(sanitizedConfig.logDir).to.contain('logDir');
        });

        it("should take the APPDir/log if dir is not set", function () {
            delete config.appDir;
            sanitizedConfig = sanitizeConfig(config);
            expect(sanitizedConfig.logDir).to.contain("log");
        });
    });
});