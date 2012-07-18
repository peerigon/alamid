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
            expect(services.server.A.create).to.be.a("function");
            expect(services.server.B.create).to.be.a("function");
            expect(services.server["B/C"].create).to.be.a("function");

            done();
        }

        expectedServices.server["B/C"] = true;
        expectedServices.server.A = true;
        expectedServices.server.B = true;

        expectedServices.client["B/C"] = true;
        expectedServices.client.A = true;
        expectedServices.client.B = true;


        collectServices = rewire("../../lib/core/collectServices.js", false);
        collectServices(servicesFolder, onCollectServicesEnd);
    });

    it("should abort on error", function (done) {
        var finder;

        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../../lib/core/collectServices.js", false);
        collectServices(testFolder, onCollectServicesError);

        finder = collectServices.__get__("unitTestLeaks").finder;
        finder.emit("error", new Error());
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