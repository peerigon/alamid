"use strict";

var expect = require("expect.js"),
    alamid = require("../../lib/index.js"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    View = require("../../lib/client/View.class.js"),
    ViewCollection = require("../../lib/client/ViewCollection.class.js"),
    Page = require("../../lib/client/Page.class.js"),
    Client = require("../../lib/client/Client.class.js");

describe("index.js (client)", function () {
    it("should export Displayable", function () {
        expect(alamid.Displayable).to.be(Displayable);
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
    it("should export Client", function () {
        expect(alamid.Client).to.be(Client);
    });
});