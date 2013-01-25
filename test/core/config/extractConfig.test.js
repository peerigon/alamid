"use strict";

var expect = require("expect.js"),
    path = require("path"),
    extractConfig = require("../../../lib/core/config/extractConfig.js");

describe("extractConfig", function () {
    var config,
        resultingConfig;

    beforeEach(function () {
        config = {
            "env" : "development",
            "server" : {
                "port" : 9191,
                "useBundling" : true
            },
            "client" : {
                basePath : "/"
            }
        };
    });

    it("should should extract the given part and merge with globals", function () {

        resultingConfig = extractConfig(config, "server");

        expect(resultingConfig.port).to.be(config.server.port);
        expect(resultingConfig.useBundling).to.be(config.server.useBundling);
        expect(resultingConfig.env).to.be(config.env);
        expect(resultingConfig).to.only.have.keys(["port", "useBundling", "env"]);
    });

    it("should should overwrite shared config with local config if set", function () {

        config.server.env = "testing";

        resultingConfig = extractConfig(config, "server");

        expect(resultingConfig.port).to.be(config.server.port);
        expect(resultingConfig.useBundling).to.be(config.server.useBundling);
        expect(resultingConfig.env).to.be(config.server.env);
        expect(resultingConfig).to.only.have.keys(["port", "useBundling", "env"]);
    });
});