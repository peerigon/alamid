"use strict";

var expect = require("expect.js");

var alamid = require("../../lib/index.js");

//util
var underscore = require("underscore"),
    logger = require("../../lib/core/logger.server.js"),
    Class = require("nodeclass").Class,
    value = require("value");

var Collection = require("../../lib/shared/Collection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    Service = require("../../lib/shared/Service.class.js"),
    Server = require("../../lib/server/Server.class.js");

var setSocketIOOptions = require("../../lib/server/transport/websocket/websocket.js").setSocketIOOptions,
    setConnectInstance = require("../../lib/server/transport/http/http.js").setConnectInstance;

describe("index.js", function () {

    it("should export underscore", function () {
        expect(alamid.util.underscore).to.equal(underscore);
    });

    it("should export the logger", function () {
        expect(alamid.util.logger).to.equal(logger);
    });

    it("should export nodeclass.Class", function () {
        expect(alamid.util.Class).to.equal(Class);
    });

    it("should export the config", function () {
        expect(alamid.config).to.be.an("object");
    });

    it("should export Collection", function () {
        expect(alamid.Collection).to.equal(Collection);
    });

    it("should export Model", function () {
        expect(alamid.Model).to.equal(Model);
    });

    it("should export ModelCollection", function () {
        expect(alamid.ModelCollection).to.equal(ModelCollection);
    });

    it("should export Service", function () {
        expect(alamid.Service).to.equal(Service);
    });

    it("should export Server", function () {
        expect(alamid.Server).to.be(Server);
    });


    it("should export createBundle", function() {
        expect(alamid.createBundle).to.be.a("function");
    });

});