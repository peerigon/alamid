"use strict";

var expect = require("../testHelpers/expect.jquery.js"),
    value = require("value"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    Page = require("../../lib/client/Page.class.js"),
    jQuery = require("../testHelpers/jquery.js"),
    collectNodeReferences = require("../testHelpers/collectNodeReferences.js");

describe("Page", function () {

    var page,
        subPage,
        ctx = {};

    beforeEach(function () {
        page = new Page(ctx);
    });

    describe("#constructor()", function () {

        it("should take '<div data-node=\"page\"></div>' as default template", function () {
            expect(page.getRoot()).to.eql('<div data-node="page"></div>');
        });
        it("should use the page-node given by the template", function () {
            page = new Page({}, '<div><article id="it-works" data-node="page"></article></div>');
            expect(page.getNode("page")).to.have.attr("id", "it-works");
        });
        it("should use the page-node given by the root-node", function () {
            var root = document.createElement("div");

            root.innerHTML = '<article id="it-works" data-node="page"></article>';
            page = new Page({}, root);
            expect(page.getNode("page")).to.have.attr("id", "it-works");
        });

    });

    describe("#context", function () {

        it("should return the context that have been passed to the constructor", function () {
            expect(page.context).to.be(ctx);
        });

    });

    describe("#setSubPage()", function () {

        beforeEach(function () {
            subPage = new Page({}, '<p id="subPage"></p>');
        });

        it("should append the sub page at the page-node", function () {
            page.setSubPage(subPage);
            expect(page.getNode("page")).to.be(subPage.getRoot().parent());
        });

        it("should throw an error if you don't pass an instance of Page", function () {
            expect(function () {
                page.setSubPage({});
            }).to.throwError();
        });

        it("should be possible to reset the page by passing null", function () {
            page.setSubPage(subPage);
            page.setSubPage(null);
            expect(page.getSubPage()).to.be(null);
        });

        it("should dispose a previously set Sub-Page", function (done) {
            var prevPage = new Page();

            page.setSubPage(prevPage);
            prevPage.once("dispose", function () {
                done();
            });
            page.setSubPage(new Page());
        });

        it("should be chainable", function () {
            expect(page.setSubPage(null)).to.be(page);
        });

    });

    describe("#getSubPage()", function () {

        beforeEach(function () {
            subPage = new Page();
            page.setSubPage(subPage);
        });

        it("should return null by default", function () {
            page = new Page();
            expect(page.getSubPage()).to.equal(null);
        });

        it("should return the previously set Sub-Page", function () {
           expect(page.getSubPage()).to.equal(subPage);
        });

    });

    describe("#dispose()", function () {

        beforeEach(function () {
            subPage = new Page();
            page.setSubPage(subPage);
        });

        it("should remove the reference to the subPage", function () {
            page.dispose();
            expect(page.getSubPage()).to.be(null);
        });

        it("should remove all node references", function () {
            var nodeRefs;

            page.dispose();
            nodeRefs = collectNodeReferences(page);
            expect(nodeRefs).to.be.empty();
        });

    });


});