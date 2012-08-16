"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    resolveFilename = require("../../../lib/core/bundle/resolveFilename.js");

var testFolder = "./resolveFilename/";

describe("resolveFilename", function() {

    it("should return a client-file as replacement for a server-file if existent", function(done) {
        resolveFilename(testFolder + "config.server.js", function(err, resolvedFilename) {
            expect(err).to.be(null);
            expect(resolvedFilename).to.eql(testFolder + "config.client.js");
            done();
        });
    });

    it("should return a client-file as replacement for a server-file if existent (for class files)", function(done) {
        resolveFilename(testFolder + "logger.server.class.js", function(err, resolvedFilename) {
            expect(err).to.be(null);
            expect(resolvedFilename).to.eql(testFolder + "logger.client.class.js");
            done();
        });
    });

    it("should return shared files without env-specific file-ending", function(done) {
        resolveFilename(testFolder + "index.js", function(err, resolvedFilename) {
            expect(err).to.be(null);
            expect(resolvedFilename).to.eql(testFolder + "index.js");
            done();
        });
    });

    it("should return shared files if existent (.class ending)", function(done) {
        resolveFilename(testFolder + "modelCache.server.class.js", function(err, resolvedFilename) {
            expect(err).to.be(null);
            expect(resolvedFilename).to.eql(testFolder + "modelCache.class.js");
            done();
        });
    });

    it("should should fail if a server-file is being required without client or shared replacement", function(done) {
        resolveFilename(testFolder + "serverOnly.server.js", function(err, resolvedFilename) {
            expect(err).to.be.an(Error);
            done();
        });
    });
});