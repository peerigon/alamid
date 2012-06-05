"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    collectServices,
    testFolder = __dirname + "/core.collectServices",
    servicesFolder = testFolder + "/compiled/services";

describe("collectServices", function () {
    beforeEach(function () {
        rewire.reset();
    });
    it("should collect appropriately", function (done) {
        var expectedServices = {
                server: {},
                client: {}
            };

        function onCollectServicesEnd(err, services) {
            expect(err).to.be(null);
            expect(services.server).to.only.have.keys(Object.keys(expectedServices.server));
            expect(services.client).to.only.have.keys(Object.keys(expectedServices.client));
            done();
        }

        expectedServices.server[servicesFolder + "/ServiceC.server.class.js"] = true;
        expectedServices.server[servicesFolder + "/A/ServiceA.server.class.js"] = true;
        expectedServices.server[servicesFolder + "/B/ServiceB.server.class.js"] = true;

        expectedServices.client[servicesFolder + "/ServiceC.client.class.js"] = true;
        expectedServices.client[servicesFolder + "/A/ServiceA.client.class.js"] = true;
        expectedServices.client[servicesFolder + "/B/ServiceB.client.class.js"] = true;


        collectServices = require("../lib/core/collectServices");
        collectServices(testFolder, onCollectServicesEnd);
    });
    it("should abort on error", function (done) {
        var finder;

        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../lib/core/collectServices.js", null, null, ["unitTestLeaks"]);
        collectServices(testFolder, onCollectServicesError);
        finder = collectServices.__.unitTestLeaks.finder;
        finder.emit("error", new Error());
    });

    // TODO finish remaining tests
});