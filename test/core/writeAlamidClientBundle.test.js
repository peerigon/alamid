"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

describe("writeAlamidClientBundle", function() {

    it("should collect all alamid-client files and browserify them", function() {

        var writeAlamidClientBundle = rewire("../../lib/core/writeAlamidClientBundle.js");

        //TODO this test will work as soon as all client-files are refactored and working

        /*
        function writeAlamidClientBundleFileMock (bundleContent, filePath, callback) {

            console.log(bundleContent);
            console.log(filePath);
            callback(null);

        }

        writeAlamidClientBundle.__set__("writeAlamidClientBundleFile", writeAlamidClientBundleFileMock);

        writeAlamidClientBundle(function(err) {
            console.log(err);
        })
        */

    });


});