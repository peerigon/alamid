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

describe("collectModels", function () {

    afterEach(function () {
        rewire.reset();
    });

    it("should collect appropriately and return required modules for server-services", function (done) {

        var expectedModels = {
            server: {},
            client: {}
        };

        function onCollectModelsEnd(err, models) {
            expect(err).to.be(null);
            expect(models.server).to.only.have.keys(Object.keys(expectedModels.server));
            expect(models.client).to.only.have.keys(Object.keys(expectedModels.client));
            expect(models.server.BlogPost).to.be.an("object");
            expect(models.server["BlogPost/Comment"]).to.be.an("object");
            done();
        }

        expectedModels.server.BlogPost = true;
        expectedModels.server["BlogPost/Comment"] = true;
        expectedModels.client.BlogPost = true;

        collectModels = rewire("../../lib/core/collectModels.js", false);
        collectModels (servicesFolder, onCollectModelsEnd);
    });

    it("should abort on error", function (done) {
        var finder;

        function onCollectModelsError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectModels = rewire("../../lib/core/collectModels.js", false);
        collectModels (servicesFolder, onCollectModelsError);

        finder = collectModels.__get__("unitTestLeaks").finder;
        finder.emit("error", new Error());
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