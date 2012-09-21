"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    Page = require("../../lib/client/Page.class.js"),
    PageExample = require("./mocks/PageExample.class.js"),
    PageDefineExample = require("./mocks/PageDefineExample.class.js");


describe("Page", function () {

    var pageExample,
        subPageExample,
        params = {
            "author": "topa",
            "test": "Page"
        };

    beforeEach(function () {
        pageExample = new PageExample(params);
    });

    describe(".define()", function () {

        it("should return an instance of Page", function () {
            expect(is(new PageDefineExample()).instanceOf(Page)).to.equal(true);
        });

        it("should provide .executeDone() defined in descriptor", function (done) {

            var definedPage = new PageDefineExample(done);

            definedPage.executeDone();
        });

    });

    describe(".construct()", function () {

        it("should be possible to overwrite the template with second argument", function () {
            pageExample = new PageExample({}, "<div></div>");

            expect(jQuery(pageExample.getNode()).find("[data-node='page']").length).to.equal(0);
        });

    });

    describe("._getParams()", function () {

        it("should provide passed params on .construct()", function () {
            expect(pageExample.getParams()).to.be.equal(params);
        });

    });

    describe(".setSubPage()", function () {

        var subPageId = "subPage";

        beforeEach(function () {
            subPageExample = new PageExample({}, "<div data-node='page'><p id='" + subPageId +"'></p></div>");
            pageExample.setSubPage(subPageExample);
        });

        it("should throw an error if you don't pass an instance of Page", function () {
            expect(function () {
                pageExample.setSubPage({});
            }).to.throwError();
        });

        it("should dispose a previously set Sub-Page", function () {
            pageExample.setSubPage(new PageExample());
            expect(subPageExample.isDisposed()).to.equal(true);
        });

        it("should append the SubPage", function () {
            var $node = jQuery(pageExample.getNode());

            expect($node.find("#" + subPageId).length).to.equal(1);
        });

    });

    describe(".getSubPage()", function () {

        beforeEach(function () {
            subPageExample = new PageExample();
            pageExample.setSubPage(subPageExample);
        });

        it("should return the previously set Sub-Page", function () {
           expect(pageExample.getSubPage()).to.equal(subPageExample);
        });

    });

});