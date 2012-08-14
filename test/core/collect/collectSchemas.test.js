"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path"),
    collectSchemas,
    modelsFolder = path.resolve(__dirname, "./collectModels");

nodeclass.registerExtension();

nodeclass.stdout = function(msg) {
    //No output in test mode
};

describe("collectSchemas", function () {

    afterEach(function () {
        rewire.reset();
    });

    it("should collect appropriately, extend schemas and return paths to the defined schemas", function () {

        var expectedSchemas = {
            server: {},
            client: {},
            shared: {}
        };

        expectedSchemas.server.blogpost = true;
        expectedSchemas.server["blogpost/comment"] = true;

        expectedSchemas.client.blogpost = true;
        expectedSchemas.client["blogpost/comment"] = true;

        expectedSchemas.shared.blogpost = true;
        expectedSchemas.shared["blogpost/comment"] = true;

        collectSchemas = rewire("../../../lib/core/collect/collectSchemas.js", false);
        var schemas = collectSchemas (modelsFolder);

        expect(schemas.server).to.only.have.keys(Object.keys(expectedSchemas.server));
        expect(schemas.client).to.only.have.keys(Object.keys(expectedSchemas.client));
        expect(schemas.shared).to.only.have.keys(Object.keys(expectedSchemas.shared));
        expect(schemas.server.blogpost).to.eql(path.resolve(__dirname, "./collectModels/BlogPost/BlogPostSchema.server.js"));

        expect(schemas.server["blogpost/comment"]).to.eql(path.resolve(__dirname, "./collectModels/BlogPost/Comment/CommentSchema.js"));
        expect(schemas.shared["blogpost/comment"]).to.be.eql(path.resolve(__dirname, "./collectModels/BlogPost/Comment/CommentSchema.js"));
    });

    it("should fail on non existing folders", function () {

        collectSchemas = rewire("../../../lib/core/collect/collectServices.js", false);

        try{
            collectSchemas(__dirname+"/non/existing/folder/");
        }
        catch(err) {
            expect(err instanceof Error).to.be(true);
        }
    });
});
