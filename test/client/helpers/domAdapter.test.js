var expect = require("expect.js"),
    domAdapter = require("../../../lib/client/helpers/domAdapter.js"),
    DOMNodeMocks = require("./../mocks/DOMNodeMocks.js"),
    jQuery = require("../../../lib/client/helpers/jQuery.js");

describe("domAdapter", function () {

    var button,
        $button,
        form,
        $form;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);
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
            var nodeReference,
                foundNodes;

            nodeReference = $form.find("[data-node]");
            nodeReference = nodeReference.add(form);

            foundNodes = domAdapter(form).find("[data-node]");

            //expect.js seems to be not able to equal references of DOMElements.
            //This Error will be thrown: TypeError: Accessing selectionDirection on an input element that cannot have a selection.
            expect(foundNodes[0].toString() === nodeReference[0].toString()).to.be.ok();
            expect(jQuery(foundNodes[0]).attr("method") === jQuery(nodeReference[0]).attr("method")).to.be.ok();
            expect(nodeReference.length).to.equal(foundNodes.length);
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
            domAdapter(form.firstChild).addClass("cool-cat");
            expect(jQuery(form.firstChild).attr("class")).to.be("cool-cat");
        });

    });

    describe(".removeClass()", function () {

        it("should remove the css-class 'cool-cat'", function () {
            jQuery(form.firstChild).addClass("cool-cat");
            domAdapter(form.firstChild).removeClass("cool-cat");
            expect(jQuery(form.firstChild).attr("class")).to.be("");
        });
    });

    describe(".hasClass()", function () {

        it("should return true if the node has the class 'cool-cat'", function () {
            jQuery(form.firstChild).addClass("cool-cat");
            expect(domAdapter(form.firstChild).hasClass("cool-cat")).to.be(true);
        });
        it("should return false if the node doesn't have the class 'cool-cat'", function () {
            expect(domAdapter(form.firstChild).hasClass("cool-cat")).to.be(false);
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