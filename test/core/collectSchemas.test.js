"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path"),
    collectSchemas,
    modelsFolder = path.resolve(__dirname, "../exampleApp/app/models");

nodeclass.registerExtension();

nodeclass.stdout = function(msg) {
    //No output in test mode
};

describe("collectSchemas", function () {

    afterEach(function () {
        rewire.reset();
    });

    it("should collect appropriately, extend schemas and return the defined schemas", function (done) {

        var expectedSchemas = {
            server: {},
            client: {},
            shared: {}
        };

        function onCollectSchemasEnd(err, schemas) {
            expect(err).to.be(null);
            expect(schemas.server).to.only.have.keys(Object.keys(expectedSchemas.server));
            expect(schemas.client).to.only.have.keys(Object.keys(expectedSchemas.client));
            expect(schemas.shared).to.only.have.keys(Object.keys(expectedSchemas.shared));
            expect(schemas.server.blogpost).to.be.an("object");

            expect(schemas.server["blogpost/comment"]).to.be.an("object");
            expect(schemas.shared["blogpost/comment"]).to.be.an("object");

            //required was overwritten by server schema
            expect(schemas.shared.blogpost.email.required).to.be(true);
            expect(schemas.server.blogpost.email.required).to.be(false);
            expect(schemas.client.blogpost.email.required).to.be(true);

            //new attribute for client only
            expect(schemas.client.blogpost.saved).not.to.be(undefined);
            expect(schemas.shared.blogpost.saved).to.be(undefined);
            expect(schemas.server.blogpost.saved).to.be(undefined);

            done();
        }

        expectedSchemas.server.blogpost = true;
        expectedSchemas.server.user = true;
        expectedSchemas.server["blogpost/comment"] = true;

        expectedSchemas.client.blogpost = true;
        expectedSchemas.client.user= true;
        expectedSchemas.client["blogpost/comment"] = true;

        expectedSchemas.shared.blogpost = true;
        expectedSchemas.shared.user= true;
        expectedSchemas.shared["blogpost/comment"] = true;

        collectSchemas = rewire("../../lib/core/collectSchemas.js", false);
        collectSchemas (modelsFolder, onCollectSchemasEnd);
    });


    it("should fail on non existing folders", function (done) {

        function onCollectModelsError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectSchemas = rewire("../../lib/core/collectServices.js", false);
        collectSchemas(__dirname+"/non/existing/folder/" , onCollectModelsError);
    });
});