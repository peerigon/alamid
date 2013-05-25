"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    getResourceUrl = require("../../../lib/shared/helpers/getResourceUrl.js");

describe("getResourceUrl()", function () {
    var resourceUrl;

    it("should incorporate all ids accordingly", function () {
        resourceUrl = getResourceUrl("blog/post/comment", {
            "blog": 1,
            "blog/post": 2,
            "blog/post/comment": 3
        });
        expect(resourceUrl).to.be("blog/1/post/2/comment/3");
    });

    it("should omit the model id if the id isn't given (necessary for POST requests)", function () {
        resourceUrl = getResourceUrl("blog/post/comment", {
            "blog": 1,
            "blog/post": 2
        });
        expect(resourceUrl).to.be("blog/1/post/2/comment");
    });

    it("should also work when there is no sub-resource", function () {
        resourceUrl = getResourceUrl("post", {});
        expect(resourceUrl).to.be("post");
        resourceUrl = getResourceUrl("post", {
            post: 1
        });
        expect(resourceUrl).to.be("post/1");
    });

    it("should throw an error if a parent id isn't given", function () {
        expect(function () {
            resourceUrl = getResourceUrl("blog/post/comment", {
                "blog/post": 2
            });
        }).to.throwError();
    });
});