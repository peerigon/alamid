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
    it("should collect appropriately and return required modules for server-services", function (done) {

        var expectedServices = {
            server: {},
            client: {}
        };

        function onCollectServicesEnd(err, services) {
            expect(err).to.be(null);
            expect(services.server).to.only.have.keys(Object.keys(expectedServices.server));
            expect(services.client).to.only.have.keys(Object.keys(expectedServices.client));
            expect(services.server["ServiceC.server.class.js"].POST).to.be.a("function");
            expect(services.server["A/ServiceA.server.class.js"].POST).to.be.a("function");
            expect(services.server["B/ServiceB.server.class.js"].POST).to.be.a("function");

            done();
        }

        expectedServices.server["ServiceC.server.class.js"] = true;
        expectedServices.server["A/ServiceA.server.class.js"] = true;
        expectedServices.server["B/ServiceB.server.class.js"] = true;

        expectedServices.client["ServiceC.client.class.js"] = true;
        expectedServices.client["A/ServiceA.client.class.js"] = true;
        expectedServices.client["B/ServiceB.client.class.js"] = true;


        collectServices = require("../lib/core/collectServices.js");
        collectServices(servicesFolder, onCollectServicesEnd);
    });

    it("should abort on error", function (done) {
        var finder;

        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../lib/core/collectServices.js");
        collectServices(testFolder, onCollectServicesError);
        finder = collectServices.__get__("unitTestLeaks").finder;
        finder.emit("error", new Error());
    });

    it("should fail on non existing folders", function (done) {
        var finder;

        function onCollectServicesError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectServices = rewire("../lib/core/collectServices.js");
        collectServices(__dirname+"/non/existing/folder/" , onCollectServicesError);
    });
});