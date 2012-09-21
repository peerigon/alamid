"use strict";

var expect = require("expect.js");

var is = require("nodeclass").is;

var Page = require("../../../lib/client/Page.class.js"),
    Default404Page = require("../../../lib/client/defaults/Default404Page.class.js");

describe("Default404Page", function () {

    var default404Page,
        pageNode,
        $pageNode;

    beforeEach(function () {
        default404Page = new Default404Page();
        pageNode = default404Page.getNode();
        $pageNode = jQuery(pageNode);
    });

    describe(".init()", function () {

        it("should by a Page", function () {
            expect(is(default404Page).instanceOf(Page)).to.be(true);
        });

        it("node should contain an h1-element with the attribute data-node='title'", function (){
            var $h1 = $pageNode.find("[data-node='title']");

            expect($h1[0].toString().search("HTMLHeadingElement") > -1).to.be(true);
        });

        it("node should contain an h2-element with the attribute data-node='sub'", function (){
            var $h1 = $pageNode.find("[data-node='sub']");

            expect($h1[0].toString().search("HTMLHeadingElement") > -1).to.be(true);
        });

        it("node should contain an p-element with the attribute data-node='message'", function (){
            var $h1 = $pageNode.find("[data-node='message']");

            expect($h1[0].toString().search("HTMLParagraphElement") > -1).to.be(true);
        });

        it("node should contain an div-element with the attribute data-node='info'", function (){
            var $h1 = $pageNode.find("[data-node='info']");

            expect($h1[0].toString().search("HTMLDivElement") > -1).to.be(true);
        });

    });

    describe(".setTitle()", function () {

        it("should set given text to h1 - node", function () {

            var title = "404";

            default404Page.setTitle(title);

            $pageNode.find("h1")

        });

    });


});