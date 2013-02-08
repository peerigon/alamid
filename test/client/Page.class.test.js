"use strict";

var expect = require("expect.js"),
    value = require("value"),
    Displayable = require("../../lib/client/Displayable.class.js"),
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

    describe(".constructor()", function () {

        it("should be possible to overwrite the template with second argument", function () {
            pageExample = new PageExample({}, "<div></div>");

            expect(jQuery(pageExample.node).find("[data-node='page']").length).to.equal(0);
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

        it("should be possible to reset the page by passing null", function (done) {
            pageExample.setSubPage(null);
            done();
        });

        it("should dispose a previously set Sub-Page", function (done) {
            var prevPage = pageExample.getSubPage();

            prevPage.once("dispose", function () {
                done();
            });
            pageExample.setSubPage(new PageExample());
        });

        it("should append the SubPage", function () {
            var $node = jQuery(pageExample.node);

            expect($node.find("#" + subPageId).length).to.equal(1);
        });

    });

    describe(".getSubPage()", function () {

        beforeEach(function () {
            subPageExample = new PageExample();
            pageExample.setSubPage(subPageExample);
        });

        it("should return null by default", function () {
            pageExample = new PageExample();
            expect(pageExample.getSubPage()).to.equal(null);
        });

        it("should return the previously set Sub-Page", function () {
           expect(pageExample.getSubPage()).to.equal(subPageExample);
        });

    });

});