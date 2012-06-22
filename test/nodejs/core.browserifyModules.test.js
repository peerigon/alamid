"use strict";

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    browserifyModules = require("../../compiled/core/browserifyModules.js"),
    config = require("../../compiled/shared/config"),
    vm = require("vm");

describe("browserifyModules", function () {

    it("should return the bundled modules as a string", function (done) {
        browserifyModules(require("path").resolve(__dirname, "../../compiled/shared"), function (bundleString) {

            var sandbox = {};

            vm.runInNewContext(bundleString, sandbox);

            var logger = sandbox.require("/compiled/shared/logger.js"),
                config = sandbox.require("/compiled/shared/config.js"),
                log = logger.get("core");

            expect(logger).not.to.be(undefined);
            expect(config).to.be.an("object");
            expect(log.info).to.be.a("function");
            //console.log(bundleString);
            done();
        });
    });

});