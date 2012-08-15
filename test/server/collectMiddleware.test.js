"use strict";

var expect = require("expect.js"),
    path = require("path"),
    collectMiddleware = require("../../lib/server/collectMiddleware.js");

describe("collectMiddleware", function () {

    it("should return the middleware for services as an usable object", function() {
        var parsedMw = collectMiddleware([], path.resolve(__dirname, "./collectMiddleware/servicesMiddleware.js"));
        expect(parsedMw).to.be.an("object");
        expect(parsedMw["blogpost/comments"]).to.be.an("object");
        expect(parsedMw.blogpost).to.be.an("object");
        expect(parsedMw.users).to.be.an("object");
        expect(parsedMw["users/friends"]).to.be.an("object");
        expect(parsedMw["users/friends/comments"]).to.be.an("object");
    });

    it("should return the middleware for validators as an usable object", function() {
        var parsedMw = collectMiddleware([], path.resolve(__dirname, "./collectMiddleware/validatorsMiddleware.js"));
        expect(parsedMw).to.be.an("object");
        expect(parsedMw.blogpost).to.be.an("object");

    });

    it("should return an error and an empty object for a path which doesn't exist", function() {
        try{
            var parsedMw =collectMiddleware([], path.resolve(__dirname, "./collectMiddleware/wrongValidatorsPath.js"));
        }
        catch(e) {
            expect(e).not.to.be(null);
        }
    });
});
