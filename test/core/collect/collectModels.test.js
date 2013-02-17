"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    collectModels = require("../../../lib/core/collect/collectModels.js");

var dirname = __dirname;

describe("collectModels", function () {

    it("should collect all models and separate them by environment", function () {
        var models = collectModels(dirname + "/collectModels");

        expect(models.server).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(models.client).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(models.server.blogpost).to.be(dirname + "/collectModels/BlogPost/BlogPost.server.class.js");
        expect(models.server["blogpost/comment"]).to.be(dirname + "/collectModels/BlogPost/Comment/Comment.server.class.js");
    });

    it("should fail on non existing folders", function () {
        expect(function () {
            collectModels(dirname + "/non/existing/folder/");
        }).to.throwError();
    });

});
