var expect = require("expect.js"),
    readConfig = require("../lib/core/readConfig.js"),
    defaultConfig = require("../lib/core/config.json");

describe("readConfig", function() {
    var result;

    it("should read the default config if nothing was passed", function () {
        result = readConfig();
        expect(result).to.eql(defaultConfig);
    });

});