"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    modelStatics = rewire("../../lib/shared/modelStatics.js");

var slice = Array.prototype.slice;

describe("modelStatics", function () {
    describe(".getResourceUrl()", function () {
        var result = {},
            ids = {
                "blog": 1,
                "blog/post": 2,
                "blog/post/comment": 3
            },
            args;

        function getResourceUrlMock() {
            args = slice.call(arguments);
            return result;
        }

        function CommentMock() {}
        CommentMock.prototype.url = "blog/post/comment";
        CommentMock.getResourceUrl = modelStatics.getResourceUrl;

        modelStatics.__set__("_getResourceUrl", getResourceUrlMock);

        it("should call getResourceUrl() with the model-url and the given ids and return the result", function () {
            expect(CommentMock.getResourceUrl(ids)).to.be(result);
            expect(args).to.eql([CommentMock.prototype.url, ids]);
        });
    });
});