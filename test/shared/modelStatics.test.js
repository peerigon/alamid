"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    modelStatics = require("../../lib/shared/modelStatics.js");

describe("modelStatics", function () {

    describe(".getResourceUrl()", function () {
        var resourceUrl;

        function ModelClassMock() {}
        ModelClassMock.prototype.url = "blog/post/comment";
        ModelClassMock.getResourceUrl = modelStatics.getResourceUrl;

        it("should incorporate all ids accordingly", function () {
            resourceUrl = ModelClassMock.getResourceUrl({
                "blog": 1,
                "blog/post": 2,
                "blog/post/comment": 3
            });
            expect(resourceUrl).to.be("blog/1/post/2/comment/3");
        });

        it("should omit the model id if the id isn't given (necessary for POST requests)", function () {
            resourceUrl = ModelClassMock.getResourceUrl({
                "blog": 1,
                "blog/post": 2
            });
            expect(resourceUrl).to.be("blog/1/post/2/comment");
        });

        it("should throw an error if a parent id isn't given", function () {
            expect(function () {
                resourceUrl = ModelClassMock.getResourceUrl("blog/post/comment", {
                    "blog/post": 2
                });
            }).to.throwError();
        });

        it("should also work when there is no sub-resource", function () {
            ModelClassMock.prototype.url = "post";
            resourceUrl = ModelClassMock.getResourceUrl({});
            expect(resourceUrl).to.be("post");
            resourceUrl = ModelClassMock.getResourceUrl({
                post: 1
            });
            expect(resourceUrl).to.be("post/1");
        });
    });
});