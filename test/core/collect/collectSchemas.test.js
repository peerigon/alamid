"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path"),
    collectSchemas,
    modelsFolder = path.resolve(__dirname, "./collectModels/app/models");

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
        expect(schemas.server.blogpost).to.eql(path.resolve(__dirname, "./collectModels/app/models/BlogPost/BlogPostSchema.js"));

        /*
         //COPY THESE tests to BOOTSTRAP.server test
         expect(schemas.shared.blogpost.email.required).to.be(true);
         expect(schemas.server.blogpost.email.required).to.be(false);
         expect(schemas.client.blogpost.email.required).to.be(true);


         //new attribute for client only
         expect(schemas.client.blogpost.saved).not.to.be(undefined);
         expect(schemas.shared.blogpost.saved).to.be(undefined);
         expect(schemas.server.blogpost.saved).to.be(undefined);
         */

        expect(schemas.server["blogpost/comment"]).to.eql(path.resolve(__dirname, "./collectModels/app/models/BlogPost/Comment/CommentSchema.js"));
        expect(schemas.shared["blogpost/comment"]).to.be.eql(path.resolve(__dirname, "./collectModels/app/models/BlogPost/Comment/CommentSchema.js"));
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
