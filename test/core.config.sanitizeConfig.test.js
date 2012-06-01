"use strict";

var expect = require("expect.js"),
    sanitizeConfig = require("../lib/core/config/sanitizeConfig.js");

describe("sanitizeConfig", function () {
    var instance,
        config;

    beforeEach(function(){
        config = {
            "port" : 1223,
            "appDir" : "/myDir",
            "logDir" : "/logDir"
        }
    });

    describe("#port", function () {

        it("should cast strings to numbers", function () {
            config.port = "1234";
            var configRes = sanitizeConfig(config);
            expect(configRes.port).to.be(1234);
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

    describe("#appDir", function() {

        it("should take the folder if passed", function(){
            var confRes = sanitizeConfig(config);
            expect(confRes.appDir).to.contain('myDir');
        });

        it("should take the CWD if dir is not set", function(){
            delete config.appDir;
            var confRes = sanitizeConfig(config);
            expect(confRes.appDir).to.contain("test");
        });
    });

    describe("#logDir", function() {

        it("should take the folder if passed", function(){
            var confRes = sanitizeConfig(config);
            expect(confRes.logDir).to.contain('logDir');
        });

        it("should take the APPDir/log if dir is not set", function(){
            delete config.appDir;
            var confRes = sanitizeConfig(config);
            expect(confRes.logDir).to.contain("log");
        });
    });
});