"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    collectValidators,
    testFolder = __dirname + "/core.collectValidators",
    validatorsFolder = testFolder + "/compiled/validators";

describe("collectValidators", function () {
    beforeEach(function () {
        rewire.reset();
    });

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

        expectedValidators.server["A/ValidatorA.server.js"] = {};
        expectedValidators.server["B/ValidatorB.server.js"] = {};
        expectedValidators.server["ValidatorC.server.js"] = {};

        expectedValidators.client["A/ValidatorA.client.js"] = true;
        expectedValidators.client["B/ValidatorB.client.js"] = true;
        expectedValidators.client["ValidatorC.client.js"] = true;

        collectValidators = require("../../lib/core/collectValidators");
        collectValidators(validatorsFolder, onCollectValidatorsEnd);
    });

    it("should abort on error", function (done) {
        var finder;

        function onCollectValidatorsError(err) {
            expect(err instanceof Error).to.be(true);
            done();
        }

        collectValidators = rewire("../../lib/core/collectValidators.js");
        collectValidators(testFolder, onCollectValidatorsError);
        finder = collectValidators.__get__("unitTestLeaks").finder;
        finder.emit("error", new Error());
    });
});