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
            expect(services).to.eql(expectedServices);
            expect(Object.keys(services.server)).to.have.length(3);
            expect(Object.keys(services.client)).to.have.length(3);
            done();
        }

        expectedServices.server[servicesFolder + "/A/ServiceA.class.server.js"] = true;
        expectedServices.server[servicesFolder + "/B/ServiceB.class.server.js"] = true;
        expectedServices.server[servicesFolder + "/ServiceC.class.server.js"] = true;
        expectedServices.client[servicesFolder + "/A/ServiceA.class.client.js"] = true;
        expectedServices.client[servicesFolder + "/B/ServiceB.class.client.js"] = true;
        expectedServices.client[servicesFolder + "/ServiceC.class.client.js"] = true;

        collectServices = rewire("../lib/core/collectServices");
        collectServices(testFolder, onCollectServicesEnd);
    });
    it("should abort on error", function () {
        /*
        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../lib/core/collectServices", null, null, ["finder"]);
        collectServices(testFolder, onCollectServicesError);
        console.log(collectServices);
        //collectServices.__.finder.emit("error", new Error());
        */
        //TODO: Include test when rewire()-leaks work properly
    });
});