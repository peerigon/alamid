"use strict";

var expect = require("expect.js");

var alamid = require("../../lib/index.js");

//util
var underscore = require("underscore"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),
    history = require("../../lib/client/helpers/historyAdapter.js"),
    logger = require("../../lib/client/logger.client.js"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is;


var config = require("../../lib/client/config.client.js");

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
        expect(alamid.util.underscore).to.equal(underscore);
    });
    it("should export jQuery", function () {
        expect(alamid.util.jQuery).to.equal(jQuery);
    });
    /*
    it("should export historyAdapter as history", function () {
        expect(alamid.util.history).to.equal(history);
    });
    */
    it("should export logger", function () {
        expect(alamid.util.logger).to.equal(logger);
    });
    it("should export nodeclass.Class", function () {
        expect(alamid.util.Class).to.equal(Class);
    });
    it("should export nodeclass.is", function () {
        expect(alamid.util.is).to.equal(is);
    });

    it("should export config", function () {
        expect(alamid.config).to.equal(config);
    });

    it("should export DisplayObject", function () {
        expect(alamid.DisplayObject).to.equal(DisplayObject);
    });
    it("should export View", function () {
        expect(alamid.View).to.equal(View);
    });
    it("should export ViewCollection", function () {
        expect(alamid.ViewCollection).to.equal(ViewCollection);
    });
    it("should export Page", function () {
        expect(alamid.Page).to.equal(Page);
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

});