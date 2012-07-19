"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path"),
    collectServices,
    testFolder = __dirname + "/collectServices",
    servicesFolder = testFolder + "/app/services";

nodeclass.registerExtension();

nodeclass.stdout = function(msg) {
    //No output in test mode
};

describe("collectServices", function () {

    afterEach(function () {
        rewire.reset();
    });

    it("should collect appropriately and return required modules for server-services", function (done) {

        var expectedServices = {
            server: {},
            client: {}
        };

        function onCollectServicesEnd(err, services) {
            expect(err).to.be(null);
            expect(services.server).to.only.have.keys(Object.keys(expectedServices.server));
            expect(services.client).to.only.have.keys(Object.keys(expectedServices.client));
            expect(services.server.A).to.be(undefined);
            expect(services.server.B).to.be(undefined);
            expect(services.server["B/C"]).to.be(undefined);

            expect(services.server.a.create).to.be.a("function");
            expect(services.server.b.create).to.be.a("function");
            expect(services.server["b/c"].create).to.be.a("function");

            done();
        }

        expectedServices.server["b/c"] = true;
        expectedServices.server.a = true;
        expectedServices.server.b = true;

        expectedServices.client["b/c"] = true;
        expectedServices.client.a = true;
        expectedServices.client.b = true;


        collectServices = rewire("../../lib/core/collectServices.js", false);
        collectServices(servicesFolder, onCollectServicesEnd);
    });


    it("should fail on non existing folders", function (done) {

        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../../lib/core/collectServices.js", false);
        collectServices(__dirname+"/non/existing/folder/" , onCollectServicesError);
    });
});