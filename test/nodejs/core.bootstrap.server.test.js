"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    fs = require("fs"),
    path = require("path"),
    bootstrap = rewire("../../lib/core/bootstrap.server.js"),
    generateClientConfig = bootstrap.generateClientConfig,
    renderBootstrapClientTemplate = bootstrap.renderBootstrapClientTemplate;

describe("bootstrap.server", function() {

    var configMock = {
        "mode" : "development",
        "secretServerConfig" : "boobs",
        "isDev" : true,
        "paths" : {
            "bundle" : path.resolve(__dirname, "./core.bootstrap/bundle")
        }
    };
    bootstrap.__set__("config", configMock);

    describe("writeClientConfig", function() {
        it("should read the config values specified in the config.client file", function() {
            var returnedClientConfig  = generateClientConfig();
            expect(returnedClientConfig.mode).to.eql("development");
            expect(returnedClientConfig.isDev).to.be(true);
            expect(returnedClientConfig.paths).to.be(undefined);
            expect(returnedClientConfig.secretServerConfig).to.be(undefined);
        });
    });

    describe("renderBootstrapClientTemplate", function() {

        bootstrap.renderBootstrapClientTemplate();

        try{
            var clientBootstrap = fs.readFileSync(path.resolve(__dirname, "./core.bootstrap/bundle/bootstrap.js"), "utf-8");
        }
        catch(e) {
            expect(e).to.be(undefined);
        }

        expect(clientBootstrap).to.contain('config.mode = "development";');
    });
});

