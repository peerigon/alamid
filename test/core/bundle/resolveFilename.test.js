"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    resolveFilename = require("../../../lib/core/bundle/resolveFilename.js");

var testFolder = path.join(__dirname, "resolveFilename");

describe("resolveFilename", function () {

    describe("alamid requires", function () {

        it("should handle a require from the alamid server folder", function () {
            expect(resolveFilename(path.join(testFolder, "alamid", "lib", "server", "modelCache.server.js"))).to
                .be(path.join(testFolder, "alamid", "lib", "client", "modelCache.client.js"));
        });

        it("should handle a require from the alamid core folder", function () {
            expect(resolveFilename(path.join(testFolder, "alamid", "lib", "core", "logger.server.js"))).to
                .be(path.join(testFolder, "alamid", "lib", "client", "logger.client.js"));
        });

        it("should map the index.server.js", function () {
            expect(resolveFilename(path.join(testFolder, "alamid", "lib", "index.server.js"))).to
                .be(path.join(testFolder, "alamid", "lib", "index.client.js"));
        });
    });

    describe("app requires", function () {

        it("should return a client-file as replacement for a server-file if existent", function () {
            expect(resolveFilename(path.join(testFolder, "config.server.js"))).to
                .be(path.join(testFolder, "config.client.js"));
        });

        it("should return a client-file as replacement for a server-file if existent (for class files)", function () {
            expect(resolveFilename(path.join(testFolder, "logger.server.class.js"))).to
                .be(path.join(testFolder, "logger.client.class.js"));
        });

        it("should return shared files without env-specific file-ending", function () {
            expect(resolveFilename(path.join(testFolder, "index.js"))).to
                .be(path.join(testFolder, "index.js"));
        });

        it("should return shared files if existent (.class ending)", function () {
            expect(resolveFilename(path.join(testFolder, "modelCache.server.class.js"))).to
                .be(path.join(testFolder, "modelCache.class.js"));
        });

        it("should fail if a server-file is being required without client or shared replacement", function () {
            expect(function () {
                resolveFilename(path.join(testFolder, "serverOnly.server.js"));
            }).to.throwError();
        });
    });
});