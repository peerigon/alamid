"use strict";

var expect = require("expect.js");

var resolvePaths = require("../../../lib/shared/helpers/resolvePaths.js"),
    resolvePathToServiceFilePath = resolvePaths.resolvePathToServiceFilePath,
    resolvePathToModelFilePath = resolvePaths.resolvePathToModelFilePath;

describe("resolvePathToServiceFilePath", function () {

    it("should return the right path with file-extension", function () {
        expect(resolvePathToServiceFilePath("services/blogpost/comment")).to.eql("services/blogpost/comment/commentService.server.class.js");
    });
});

describe("resolvePathToModelFilePath", function () {

    it("should return the right path with file-extension", function () {
        expect(resolvePathToModelFilePath("services/blogpost/comment")).to.eql("services/blogpost/comment/Comment.server.class.js");
    });

});