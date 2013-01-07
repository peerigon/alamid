"use strict";

var expect = require("expect.js");

var value = require("value");

var Page = require("../../../lib/client/Page.class.js"),
    Default404Page = require("../../../lib/client/defaults/Default404Page.class.js");

describe("Default404Page", function () {

    var default404Page,
        pageNode,
        $pageNode;

    beforeEach(function () {
        default404Page = new Default404Page();
        pageNode = default404Page.node;
        $pageNode = jQuery(pageNode);
    });

    describe(".init()", function () {

        it("should by a Page", function () {
            expect(value(default404Page).instanceOf(Page)).to.be(true);
        });

        it("node should contain one element with the attribute data-node='title'", function (){
            var $h1 = $pageNode.find("[data-node='title']");

            expect($h1.length).to.equal(1);
        });

        it("node should contain one element with the attribute data-node='sub'", function (){
            var $h1 = $pageNode.find("[data-node='sub']");

            expect($h1.length).to.equal(1);
        });

        it("node should contain one element with the attribute data-node='message'", function (){
            var $h1 = $pageNode.find("[data-node='message']");

            expect($h1.length).to.equal(1);
        });

        it("node should contain one element with the attribute data-node='info'", function (){
            var $h1 = $pageNode.find("[data-node='info']");

            expect($h1.length).to.equal(1);
        });

    });

    describe(".setTitle()", function () {

        it("should set given text to title node", function () {

            var title = "404",
                $titleNode = $pageNode.find("[data-node='title']");

            default404Page.setTitle(title);

            expect($titleNode.text()).to.equal(title);

        });

    });

    describe(".setSubTitle()", function () {

        it("should set given text to title node", function () {

            var subTitle = "Page not found",
                $subTitleNode = $pageNode.find("[data-node='sub']");

            default404Page.setSubTitle(subTitle);

            expect($subTitleNode.text()).to.equal(subTitle);

        });

    });

    describe(".setMessage()", function () {

        it("should set given text to title node", function () {

            var message = "This is alamid's default 404 Page. It will be only shown in development mode.",
                $messageTitleNode = $pageNode.find("[data-node='message']");

            default404Page.setMessage(message);

            expect($messageTitleNode.text()).to.equal(message);

        });

    });

    describe(".setInfo()", function () {

        it("should set given text to title node", function () {

            var info = {
                    route: "blog/post",
                    params: {
                        "key": "value",
                        "array": "1,2,3"
                    }
                },
                $infoNode = $pageNode.find("[data-node='info']");

            default404Page.setInfo(info);

            expect($infoNode.text()).to.equal(JSON.stringify(info, null, 4));

        });

    });


});