"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    collectServices = require("../../../lib/core/collect/collectServices.js"),
    servicesFolder = __dirname + "/collectServices";

var dirname = __dirname;

describe("collectServices", function () {

    it("should collect all services and separate them by environment", function () {
        var services = collectServices(servicesFolder);

        expect(services.server).to.only.have.keys(["a", "a/d", "b", "b/c"]);
        expect(services.client).to.only.have.keys(["a", "b", "b/c"]);

        // no uppercase
        expect(services.server.A).to.be(undefined);
        expect(services.server.B).to.be(undefined);
        expect(services.server["B/C"]).to.be(undefined);

        expect(services.server.a).to.be(dirname + "/collectServices/A/AService.server.class.js");
        expect(services.server["a/d"]).to.be(dirname + "/collectServices/A/D/DService.server.class.js");
        expect(services.server.b).to.be(dirname + "/collectServices/B/BService.server.class.js");
        expect(services.server["b/c"]).to.be(dirname + "/collectServices/B/C/CService.server.class.js");

        expect(services.client.a).to.be(dirname + "/collectServices/A/AService.client.class.js");
        expect(services.client.b).to.be(dirname + "/collectServices/B/BService.client.class.js");
        expect(services.client["b/c"]).to.be(dirname + "/collectServices/B/C/CService.client.class.js");
    });

    it("should fail on non existing folders", function () {
        expect(function () {
            collectServices(dirname + "/non/existing/folder/");
        }).to.throwError();
    });
});
