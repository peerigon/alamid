"use strict";

var expect = require("expect.js"),
    alamid = require("../../lib/index.js"),
    underscore = require("underscore"),
    logger = require("../../lib/shared/logger.js"),
    Class = require("alamid-class"),
    value = require("value"),
    config = require("../../lib/shared/config.js"),
    env = require("../../lib/shared/env.js"),
    Collection = require("../../lib/shared/Collection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    Base = require("../../lib/shared/Base.class.js"),
    Event = require("../../lib/shared/Event.class.js"),
    Service = require("../../lib/shared/Service.class.js");

describe("index.js", function () {
    it("should export underscore", function () {
        expect(alamid.util.underscore).to.be(underscore);
    });
    it("should export the logger", function () {
        expect(alamid.util.logger).to.be(logger);
    });
    it("should export the logger", function () {
        expect(alamid.util.value).to.be(value);
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
    it("should export Collection", function () {
        expect(alamid.Collection).to.be(Collection);
    });
    it("should export Model", function () {
        expect(alamid.Model).to.be(Model);
    });
    it("should export ModelCollection", function () {
        expect(alamid.ModelCollection).to.be(ModelCollection);
    });
    it("should export Base", function () {
        expect(alamid.Base).to.be(Base);
    });
    it("should export Event", function () {
        expect(alamid.Event).to.be(Event);
    });
    it("should export Service", function () {
        expect(alamid.Service).to.be(Service);
    });
});