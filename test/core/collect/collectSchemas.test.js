"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    collectSchemas = require("../../../lib/core/collect/collectSchemas.js");

var dirname = __dirname;

describe("collectSchemas", function () {

    it("should collect all schemas and separate them by environment", function () {
        var schemas = collectSchemas(dirname + "/collectModels");

        expect(schemas.server).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(schemas.client).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(schemas.shared).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(schemas.server.blogpost).to.be(dirname + "/collectModels/BlogPost/BlogPostSchema.server.js");
        expect(schemas.shared.blogpost).to.be(dirname + "/collectModels/BlogPost/BlogPostSchema.js");
        expect(schemas.client.blogpost).to.be(dirname + "/collectModels/BlogPost/BlogPostSchema.client.js");
        expect(schemas.server["blogpost/comment"]).to.eql(dirname + "/collectModels/BlogPost/Comment/CommentSchema.js");
        expect(schemas.shared["blogpost/comment"]).to.eql(dirname + "/collectModels/BlogPost/Comment/CommentSchema.js");
        expect(schemas.client["blogpost/comment"]).to.eql(dirname + "/collectModels/BlogPost/Comment/CommentSchema.js");
    });

    it("should fail on non existing folders", function () {
        expect(function () {
            collectSchemas(dirname + "/non/existing/folder/");
        }).to.throwError();
    });

});
