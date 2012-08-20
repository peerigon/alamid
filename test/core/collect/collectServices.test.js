"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path"),
    collectServices,
    servicesFolder = __dirname + "/collectServices";

describe("collectServices", function () {

    it("should collect appropriately and return required modules for server-services", function () {

        var expectedServices = {
            server: {},
            client: {}
        };

        expectedServices.server["b/c"] = true;
        expectedServices.server.a = true;
        expectedServices.server.b = true;
        expectedServices.server["a/d"] = true;

        expectedServices.client["b/c"] = true;
        expectedServices.client.a = true;
        expectedServices.client.b = true;


        collectServices = rewire("../../../lib/core/collect/collectServices.js", false);
        var services = collectServices(servicesFolder);

        expect(services.server).to.only.have.keys(Object.keys(expectedServices.server));
        expect(services.client).to.only.have.keys(Object.keys(expectedServices.client));
        expect(services.server.A).to.be(undefined);
        expect(services.server.B).to.be(undefined);
        expect(services.server["B/C"]).to.be(undefined);
    });

    it("should fail on non existing folders", function () {

        collectServices = rewire("../../../lib/core/collect/collectServices.js", false);

        try{
            collectServices(__dirname+"/non/existing/folder/");
        }
        catch(err) {
            expect(err instanceof Error).to.be(true);
        }
    });
});
