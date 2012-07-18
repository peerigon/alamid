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

    it("should collect appropriately and return the defined schemas", function (done) {

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
            expect(schemas.server.BlogPost).to.be.an("object");
            expect(schemas.server["BlogPost/Comment"]).to.be.an("object");
            expect(schemas.shared["BlogPost/Comment"]).to.be.an("object");
            done();
        }

        expectedSchemas.server.BlogPost = true;
        expectedSchemas.server.User= true;
        expectedSchemas.server["BlogPost/Comment"] = true;

        expectedSchemas.client.BlogPost = true;
        expectedSchemas.client.User= true;
        expectedSchemas.client["BlogPost/Comment"] = true;

        expectedSchemas.shared.BlogPost = true;
        expectedSchemas.shared.User= true;
        expectedSchemas.shared["BlogPost/Comment"] = true;

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