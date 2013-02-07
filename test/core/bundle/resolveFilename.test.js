"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    resolveFilename = require("../../../lib/core/bundle/resolveFilename.js");

var testFolder = "someLoader.js!otherLoader.js!" + path.join(__dirname, "resolveFilename");

describe("resolveFilename", function() {

    describe("alamid requires", function() {

        beforeEach(function () {
            resolveFilename.statCache = {};
        });

        it("should handle a require from the alamid server folder", function(done) {
            resolveFilename(testFolder + "/alamid/lib/server/modelCache.server.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "alamid", "lib", "client", "modelCache.client.js"));
                done();
            });
        });

        it("should handle a require from the alamid core folder", function(done) {
            resolveFilename(testFolder + "/alamid/lib/core/logger.server.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "alamid", "lib", "client", "logger.client.js"));
                done();
            });
        });
    });

    describe("app requires", function() {

        beforeEach(function () {
            resolveFilename.statCache = {};
        });

        it("should return a client-file as replacement for a server-file if existent", function(done) {
            resolveFilename(testFolder + "/config.server.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "config.client.js"));
                done();
            });
        });

        it("should return a client-file as replacement for a server-file if existent (for class files)", function(done) {
            resolveFilename(testFolder + "/logger.server.class.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "logger.client.class.js"));
                done();
            });
        });

        it("should return shared files without env-specific file-ending", function(done) {
            resolveFilename(testFolder + "/index.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "index.js"));
                done();
            });
        });

        it("should return shared files if existent (.class ending)", function(done) {
            resolveFilename(testFolder + "/modelCache.server.class.js", function(err, resolvedFilename) {
                expect(err).to.be(null);
                expect(resolvedFilename).to.eql(path.join(testFolder, "modelCache.class.js"));
                done();
            });
        });

        it("should fail if a server-file is being required without client or shared replacement", function(done) {
            resolveFilename(testFolder + "/serverOnly.server.js", function(err, resolvedFilename) {
                expect(err).to.be.an(Error);
                done();
            });
        });

        it("should fail if the file doesn't exist", function (done) {
            resolveFilename(testFolder + "/abc", function (err) {
                expect(err).to.be.an(Error);
                done();
            });
        });
    });
});