"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path"),
    collectModels,
    testFolder = __dirname + "/collectModels",
    servicesFolder = testFolder + "/app/models";

nodeclass.registerExtension();

nodeclass.stdout = function(msg) {
    //No output in test mode
};
/*
describe("collectModels", function () {

    afterEach(function () {
        rewire.reset();
    });

    it("should collect appropriately and return required modules for server-services", function () {

        var expectedModels = {
            server: {},
            client: {}
        };

        expectedModels.server.blogpost = true;
        expectedModels.server["blogpost/comment"] = true;
        expectedModels.client.blogpost = true;

        collectModels = rewire("../../lib/core/collectModels.js", false);
        var models = collectModels(servicesFolder);

        expect(models.server).to.only.have.keys(Object.keys(expectedModels.server));
        expect(models.client).to.only.have.keys(Object.keys(expectedModels.client));
        expect(models.server.blogpost).to.be.an("object");
        expect(models.server["blogpost/comment"]).to.be.an("object");
    });

    it("should fail on non existing folders", function (done) {

        function onCollectModelsError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectModels = rewire("../../lib/core/collectServices.js", false);
        collectModels(__dirname+"/non/existing/folder/" , onCollectModelsError);
    });
});
    */