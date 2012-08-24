"use strict";

var path = require("path"),
    expect = require("expect.js");

var createFakePackageJSON = require("../helpers/createFakePackageJSON.js"),
    removeFakePackageJSON = require("../helpers/removeFakePackageJSON.js");

describe("alamidAPI", function() {


    before(function(done) {
        createFakePackageJSON(done);
    });

    after(function(done) {
        removeFakePackageJSON(done);
    });

    it("should contain all basic alamid modules", function() {
        var alamid = require("alamid");
        expect(alamid).to.have.keys(["Model", "ModelCollection", "Service", "startServer", "util", "config", "createBundle"]);
    });

    it("should contain additional util-modules", function() {
        var util = require("alamid").util;
        expect(util).to.have.keys(["Class", "is", "isEach", "_"]);
    });
});