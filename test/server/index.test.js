"use strict";

var expect = require("expect.js");

var alamid = require("../../lib/index.js");

//util
var underscore = require("underscore"),
    logger = require("../../lib/core/logger.server.js"),
    Class = require("alamid-class"),
    value = require("value");

var config = require("../../lib/core/config.server.js"),
    env = require("../../lib/server/env.server.js");

var Collection = require("../../lib/shared/Collection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    Service = require("../../lib/shared/Service.class.js"),
    Server = require("../../lib/server/Server.class.js");

describe("index.js", function () {
    it("should export underscore", function () {
        expect(alamid.util.underscore).to.be(underscore);
    });
    it("should export the logger", function () {
        expect(alamid.util.logger).to.be(logger);
    });
    it("should export config", function () {
        expect(alamid.config).to.be(config);
    });
    it("should export env", function () {
        expect(alamid.env).to.be(env);
    });
    it("should export Class", function () {
        expect(alamid.util.Class).to.be(Class);
    });
    it("should export the config", function () {
        expect(alamid.config).to.be(config);
    });
    it("should export Collection", function () {
        expect(alamid.Collection).to.be(Collection);
    });
    it("should export Model", function () {
        expect(alamid.Model).to.be(Model);
    });
    it("should export ModelCollection", function () {
        expect(alamid.ModelCollection).to.be(ModelCollection);
    });
    it("should export Service", function () {
        expect(alamid.Service).to.be(Service);
    });
    it("should export Server", function () {
        expect(alamid.Server).to.be(Server);
    });
    it("should export createBundle", function() {
        expect(alamid.createBundle).to.be.a("function");
    });
});