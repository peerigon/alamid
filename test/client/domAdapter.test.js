var expect = require("expect.js"),
    domAdapter = require("../../lib/client/domAdapter.js");

describe("domAdapter", function () {

    var form,
        $form;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);
    });

    describe("HTTP", function () {

        describe("# request()", function () {

            it("should return a jqXHR-Object", function () {
                var jqXHR = domAdapter.request("post", "", {}, function () {});
                expect(jqXHR.abort).to.be.a(Function); //Detect jqXHR-Object by duck-typing
                jqXHR.abort();
            });

            it("should throw an Error with 'lkafskglfshg' as url", function (done) {
                domAdapter.request("post", "lkafskglfshg", {}, function (err, data) {
                    expect(err).to.be.an(Error);
                    done();
                });
            });

        });

    });

    describe("Selectors", function () {

        describe("# find()", function () {

            it("should find all nodes with an data-node-attribute", function () {
                var nodeReference,
                    foundNodes;

                nodeReference = $form.find("[data-node]");
                nodeReference = nodeReference.add(form);

                foundNodes = domAdapter(form).find("[data-node]");

                //expect.js seems to be not able to equal references of DOMElements.
                //This Error will be thrown: TypeError: Accessing selectionDirection on an input element that cannot have a selection.
                expect(foundNodes[0].toString() === nodeReference[0].toString()).to.be.ok();
                expect(foundNodes[1].toString() === nodeReference[1].toString()).to.be.ok();
                expect(foundNodes[2].toString() === nodeReference[2].toString()).to.be.ok();
                expect(foundNodes[3].toString() === nodeReference[3].toString()).to.be.ok();

                expect(jQuery(foundNodes[0]).attr("method") === jQuery(nodeReference[0]).attr("method")).to.be.ok();
                expect(jQuery(foundNodes[1]).val() === jQuery(nodeReference[1]).val()).to.be.ok();
                expect(jQuery(foundNodes[2]).val() === jQuery(nodeReference[2]).val()).to.be.ok();
                expect(jQuery(foundNodes[3]).val() === jQuery(nodeReference[3]).val()).to.be.ok();
            });

        });

    });

    describe("Events", function () {

        var button,
            $button;

        beforeEach(function () {
            button = $form.find("input[type='button']")[0];
            $button = jQuery(button);
        });

        describe("# on()", function () {

            it("should execute the binded event-listener", function (done) {
                domAdapter(button).on("click", function () {
                    done();
                });

                $button.trigger("click");
            });

        });

        describe("# off()", function () {

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

    });

    describe("Attributes", function () {

        var className = "cool-cat-class";

        describe("# addClass()", function () {

            it("should have a class '" + className + '"', function () {
                domAdapter(form.firstChild).addClass(className);
                expect(jQuery(form.firstChild).attr("class")).to.be.equal(className);
            });

        });

        describe("# removeClass()", function () {

            it("should not have a class '" + className + "'", function () {
                jQuery(form.firstChild).addClass(className);
                domAdapter(form.firstChild).removeClass(className);
                expect(jQuery(form.firstChild).attr("class")).to.be.equal("");
            });
        });

        describe("# hasClass()", function () {

            it("should have the class '" + className + "'", function () {
                jQuery(form.firstChild).addClass(className);
                expect(domAdapter(form.firstChild).hasClass(className)).to.be.ok();
            });

        });

    });

    describe("Destroy & Dispose", function () {

        describe("# destroy()", function () {

            it("should remove the element from DOMElement", function () {
                var inputA = $form.find("[data-node='child-input-a']")[0];

                domAdapter(inputA).destroy();
                expect($form.find("[data-node='child-input-a']")[0] === undefined).to.be.ok();
            });

            //If you destroy an element from a DOMNode and you keep the reference to it, it should be still able to
            //append it somewhere else with all its events.
            it("should still listen to events if you trigger them explicitly on the removed element", function (done) {
                var inputA = $form.find("[data-node='child-input-a']")[0];

                domAdapter(inputA).on("click", function () {
                    done();
                });

                domAdapter(inputA).destroy();

                jQuery(inputA).trigger("click");
            });

        });

        describe("# dispose()", function () {

            it("should remove the element form DOMElemet like # destroy()", function () {
                var $inputA = $form.find("[data-node='child-input-a']"),
                    inputA = $inputA[0];

                domAdapter(inputA).dispose();
                expect($form.find("[data-node='child-input-a']").length === 0).to.be.ok();
            });

            it("should not listen to any event anymore even if it is triggered explicitly", function (done) {
                var $inputA = $form.find("[data-node='child-input-a']"),
                    inputA = $inputA[0];

                $inputA.on("click", function () { done(); });
                $inputA.on("blur", function () { done(); });

                domAdapter(inputA).dispose();

                $inputA.trigger("click");
                $inputA.trigger("blur");

                done();
            });

        });

    });

    describe("JSON", function () {

        var json;

        beforeEach(function () {
            json = {
                "this": "is",
                "1": "unit",
                "test": null
            };
        });

        describe("# stringifyJSON()", function () {

            it("should behave like JSON.stringify", function () {
                expect(domAdapter.stringifyJSON(json)).to.be.equal(JSON.stringify(json));
            });

        });

        describe("# parseJSON()", function () {

            it("should be a cross client compatible JSON parser", function () {
                var string = jQuery.parseJSON(json);
                expect(domAdapter.parseJSON(json)).to.be.equal(string);
            });

        });

    });

    describe("Queries", function () {

        var queryObject,
            queryString;

        beforeEach(function () {
            queryObject = { "this": "is", "1": "unit", "test": "" };
            queryString = "1%3Dunit%26this%3Dis%26test%3D";
        });

        describe("# stringifyQuery()", function () {

            it("should return an equal query-string to '1=unit&this=is&test='", function (){
                expect(domAdapter.stringifyQuery(queryObject)).to.be.equal(queryString);
            });

        });

        describe("# parseQuery()", function () {

            it("should parse '1=unit&this=is&test=' to an to the reference eql object", function () {
                expect(domAdapter.parseQuery(queryString)).to.be.eql(queryObject);
            });

        });
    });

});