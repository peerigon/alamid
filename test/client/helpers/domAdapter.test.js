var expect = require("expect.js"),
    domAdapter = require("../../../lib/client/helpers/domAdapter.js"),
    jQuery = require("../../testHelpers/jquery.js");

describe("domAdapter", function () {

    var formTemplate =
            "<form data-node='form' action='?' method='post'>" +
                "<input data-node='inputA' type='text' value='a'/>" +
                "<input data-node='inputB' type='text' value='b'/>" +
                "<input data-node='inputC' type='button' value='c'/>" +
            "</form>",
        button,
        $button,
        $form;

    beforeEach(function () {
        $form = jQuery(formTemplate);
        button = $form.find("input[type='button']")[0];
        $button = jQuery(button);
    });

    describe(":$", function () {

        it("should export the dom library function", function () {
            expect(domAdapter.$).to.be.a(Function);
        });

    });


    describe(":request()", function () {

        var jqXHR;

        it("should return a jqXHR-Object", function () {
            jqXHR = domAdapter.request("post", "", {}, function () {});
            expect(jqXHR.abort).to.be.a(Function); //Detect jqXHR-Object by duck-typing
            jqXHR.abort();
        });

        it("should throw an Error with 'lkafskglfshg' as url", function (done) {
            jqXHR = domAdapter.request("post", "lkafskglfshg", {}, function (err, data) {
                expect(err).to.be.an(Error);
                done();
            });
            jqXHR.abort();
        });

    });

    describe(".find()", function () {

        it("should find all nodes with an data-node-attribute", function () {
            var expectedNodes,
                actualNodes;

            expectedNodes = $form.find("[data-node]").toArray();
            expectedNodes.unshift($form[0]);
            actualNodes = domAdapter($form).find("[data-node]").toArray();

            expect(actualNodes).to.eql(expectedNodes);
        });

    });

    describe(".on()", function () {

        it("should execute the binded event-listener", function (done) {
            domAdapter(button).on("click", function onClick() {
                done();
            });

            $button.trigger("click");
        });

    });

    describe(".off()", function () {

        it("should not execute listener A", function (done) {
            var listenerA = function () {
                done();
            };

            var listenerB = function () {
                done();
            };

            domAdapter(button).on("click", listenerA);
            domAdapter(button).on("click", listenerB);

            domAdapter(button).off("click", listenerA);

            $button.trigger("click");
        });

        it("should not execute any click-listener", function (done) {
            var listenerA = function () {
                    done();
                },
                listenerB = function () {
                    done();
                };

            domAdapter(button).on("click", listenerA);
            domAdapter(button).on("click", listenerB);

            domAdapter(button).off("click");

            $button.trigger("click");

            done();
        });

        it("should not execute any listener", function (done) {
            var listenerA = function () {
                    //a = "e";
                    done();
                },
                listenerB = function () {
                    //b = "f";
                    done();
                },
                listenerC = function () {
                    done();
                };

            domAdapter(button).on("click", listenerA);
            domAdapter(button).on("blur", listenerB);
            domAdapter(button).on("focus", listenerC);

            domAdapter(button).off();

            $button.trigger("click");
            $button.trigger("blur");
            $button.trigger("focus");

            done();

        });

    });

    describe(".addClass()", function () {

        it("should add the css class 'cool-cat'", function () {
            domAdapter($form[0]).addClass("cool-cat");
            expect($form).to.have.cssClass("cool-cat");
        });

    });

    describe(".removeClass()", function () {

        it("should remove the css-class 'cool-cat'", function () {
            $form.addClass("cool-cat"); // ensuring that the class is added
            domAdapter($form[0]).removeClass("cool-cat");
            expect($form).not.to.have.cssClass("cool-cat");
        });
    });

    describe(".hasClass()", function () {

        it("should return true if the node has the class 'cool-cat'", function () {
            $form.addClass("cool-cat"); // ensuring that the class is added
            expect(domAdapter($form).hasClass("cool-cat")).to.be(true);
        });
        it("should return false if the node doesn't have the class 'cool-cat'", function () {
            $form.removeClass("cool-cat"); // ensuring that the class is added
            expect(domAdapter($form).hasClass("cool-cat")).to.be(false);
        });

    });

    describe(".dispose()", function () {

        it("should remove the element form DOMElemet like # destroy()", function () {
            var $inputA = $form.find("[data-node='input-a']"),
                inputA = $inputA[0];

            domAdapter(inputA).dispose();
            expect($form.find("[data-node='input-a']").length === 0).to.be.ok();
        });

        it("should not listen to any event anymore even if it is triggered explicitly", function (done) {
            var $inputA = $form.find("[data-node='input-a']"),
                inputA = $inputA[0];

            //Must be attached with domAdapter, cause if element is not part of the DOM it is not reachable by jQuery.
            domAdapter(inputA).on("click", function () { done(); });
            domAdapter(inputA).on("blur", function () { done(); });

            domAdapter(inputA).dispose();

            $inputA.trigger("click");
            $inputA.trigger("blur");

            done();
        });

    });

});