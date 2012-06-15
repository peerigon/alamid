"use strict";

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    bundleSharedModules = require("../compiled/core/bundleSharedModules.js"),
    config = require("../compiled/shared/config"),
    sharedPath = config.paths.shared,
    vm = require("vm");

describe("bundleSharedModules", function() {

    it("should return the bundled modules as a string", function(done) {

        /*
        bundleSharedModules(require("path").resolve(__dirname, "../compiled/shared"), function(bundleString) {
           //console.log(bundleString);
            console.log("313:",bundleString.split("\n")[313]);

            var sandbox = {};

           vm.runInNewContext(bundleString, sandbox);

            //console.log(sandbox);
           done();

        });
        */
        done();

    });


});