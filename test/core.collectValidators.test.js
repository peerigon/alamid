"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    collectValidators,
    testFolder = __dirname + "/core.collectValidators",
    validatorsFolder = testFolder + "/compiled/validators";

describe("collectValidators", function () {
    /*
    beforeEach(function () {
        //rewire.reset();
    });
    */
    it("should collect appropriately", function (done) {
        var expectedValidators = {
                server: {},
                client: {}
            };

        function onCollectValidatorsEnd(err, validators) {
            expect(err).to.be(null);
            expect(validators).to.eql(expectedValidators);
            expect(Object.keys(validators.server)).to.have.length(3);
            expect(Object.keys(validators.client)).to.have.length(3);
            done();
        }

        expectedValidators.server[validatorsFolder + "/A/ValidatorA.server.js"] = true;
        expectedValidators.server[validatorsFolder + "/B/ValidatorB.server.js"] = true;
        expectedValidators.server[validatorsFolder + "/ValidatorC.server.js"] = true;
        expectedValidators.client[validatorsFolder + "/A/ValidatorA.client.js"] = true;
        expectedValidators.client[validatorsFolder + "/B/ValidatorB.client.js"] = true;
        expectedValidators.client[validatorsFolder + "/ValidatorC.client.js"] = true;

        collectValidators = require("../lib/core/collectValidators");
        collectValidators(testFolder, onCollectValidatorsEnd);
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