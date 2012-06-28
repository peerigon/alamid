"use strict";

var expect = require("expect.js"),
    path = require("path"),
    collectMiddleware = require("../../lib/server/collectMiddleware.js");

describe("collectMiddleware", function () {

    it("should return the middlewares for services as an usable object", function() {
        collectMiddleware(path.resolve(__dirname, "./collectMiddleware/servicesMiddleware.js"), function(err, parsedMw) {
            expect(parsedMw).to.be.an("object");
            expect(parsedMw["blogPost/comments"]).to.be.an("object");
            expect(parsedMw.blogPost).to.be.an("object");
            expect(parsedMw.users).to.be.an("object");
            expect(parsedMw["users/friends"]).to.be.an("object");
            expect(parsedMw["users/friends/comments"]).to.be.an("object");
        });
    });

    it("should return the middlewares for validators as an usable object", function() {
        collectMiddleware(path.resolve(__dirname, "./collectMiddleware/validatorsMiddleware.js"), function(err, parsedMw) {
            expect(parsedMw).to.be.an("object");
            expect(parsedMw.blogPost).to.be.an("object");
        });
    });

    it("should return an error and an empty object for a path which doesn't exist", function() {
        collectMiddleware(path.resolve(__dirname, "./collectMiddleware/wrongValidatorsPath.js"), function(err, parsedMw) {
            expect(parsedMw).to.be.an("object");
            expect(err).not.to.be(null);
        });
    });
});
