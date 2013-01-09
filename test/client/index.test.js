"use strict";

var expect = require("expect.js");

var alamid = require("../../lib/index.js");

//util
var underscore = require("underscore"),
    Class = require("alamid-class"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),
    history = require("../../lib/client/helpers/historyAdapter.js"),
    logger = require("../../lib/client/logger.client.js"),
    value = require("value");

var config = require("../../lib/client/config.client.js"),
    env = require("../../lib/client/env.client.js");

var DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    View = require("../../lib/client/View.class.js"),
    ViewCollection = require("../../lib/client/ViewCollection.class.js"),
    Page = require("../../lib/client/Page.class.js");

var Collection = require("../../lib/shared/Collection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js");

var Service = require("../../lib/shared/Service.class.js");

describe("index.js", function () {

    it("should export underscore", function () {
        expect(alamid.util.underscore).to.be(underscore);
    });
    it("should export jQuery", function () {
        expect(alamid.util.jQuery).to.be(jQuery);
    });
    /*
    it("should export historyAdapter as history", function () {
        expect(alamid.util.history).to.be(history);
    });
    */
    it("should export logger", function () {
        expect(alamid.util.logger).to.be(logger);
    });
    it("should export nodeclass.Class", function () {
        expect(alamid.util.Class).to.be(Class);
    });
    it("should export config", function () {
        expect(alamid.config).to.be(config);
    });
    it("should export env", function () {
        expect(alamid.env).to.be(env);
    });
    it("should export DisplayObject", function () {
        expect(alamid.DisplayObject).to.be(DisplayObject);
    });
    it("should export View", function () {
        expect(alamid.View).to.be(View);
    });
    it("should export ViewCollection", function () {
        expect(alamid.ViewCollection).to.be(ViewCollection);
    });
    it("should export Page", function () {
        expect(alamid.Page).to.be(Page);
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

});