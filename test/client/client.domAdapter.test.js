"use strict";

var expect = require("expect.js"),
    domAdapter = require("../../lib/client/domAdapter.js");

describe("domAdapter", function () {

    var form;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
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

            it("should find all input fields of the form", function () {
                var formInputs = form.getElementsByTagName("input"),
                    foundInputs = domAdapter.find("input", form);

                //expect.js seems to be not able to equal references of DOMElements.
                //This Error will be thrown: TypeError: Accessing selectionDirection on an input element that cannot have a selection.
                expect(jQuery(formInputs[0]).val()).to.be.equal(jQuery(foundInputs[0]).val());
                expect(jQuery(formInputs[1]).val()).to.be.equal(jQuery(foundInputs[1]).val());
                expect(jQuery(formInputs[2]).val()).to.be.equal(jQuery(foundInputs[2]).val());
            });

        });

        describe("# findNodes()", function () {

            it("should find all elements with attribute 'data-node'", function () {
                var dataNodeNodes = jQuery(form).find("[data-node]"),
                    foundDataNodeNodes = domAdapter.findNodes(null, form);

                //@see above described problem
                expect(jQuery(dataNodeNodes[0]).attr("data-node")).to.be.equal(jQuery(foundDataNodeNodes[0]).attr("data-node"));
                expect(jQuery(dataNodeNodes[1]).attr("data-node")).to.be.equal(jQuery(foundDataNodeNodes[1]).attr("data-node"));
                expect(jQuery(dataNodeNodes[2]).attr("data-node")).to.be.equal(jQuery(foundDataNodeNodes[2]).attr("data-node"));
                expect(jQuery(dataNodeNodes[3]).attr("data-node")).to.be.equal(jQuery(foundDataNodeNodes[3]).attr("data-node"));
                expect(jQuery(dataNodeNodes[4]).attr("data-node")).to.be.equal(jQuery(foundDataNodeNodes[4]).attr("data-node"));
            });

        });

    });

    describe("Events", function () {
        var button,
            jQButton;

        beforeEach(function () {
            button = jQuery(form).find("input[type='button']")[0];
            jQButton = jQuery(button);
        });

        describe("# on()", function () {

            it("should execute the binded event-listener", function (done) {
                domAdapter.on(button, "click", function () {
                    done();
                });

                jQButton.trigger("click");
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

                domAdapter.on(button, "click", listenerA);
                domAdapter.on(button, "click", listenerB);

                domAdapter.off(button, "click", listenerA);

                jQButton.trigger("click");
            });

            it("should not execute any click-listener", function (done) {
                var listenerA = function () {
                        done();
                    },
                    listenerB = function () {
                        done();
                    };

                domAdapter.on(button, "click", listenerA);
                domAdapter.on(button, "click", listenerB);

                domAdapter.off(button, "click");

                jQButton.trigger("click");

                done();
            });

            it("should not execute any listener", function (done) {
                var listenerA = function () {
                        done();
                    },
                    listenerB = function () {
                        done();
                    },
                    listenerC = function () {
                      done();
                    };

                domAdapter.on(button, "click", listenerA);
                domAdapter.on(button, "blur", listenerB);
                domAdapter.on(button, "focus", listenerC);

                domAdapter.off(button);

                jQButton.trigger("click");
                jQButton.trigger("blur");
                jQButton.trigger("focus");

                done();

            });

        });

    });

    describe("Attributes", function () {

        var className = "cool-cat-class";

        describe("# addClass()", function () {

            it("should have a class '" + className + '"', function () {
                domAdapter.addClass(form.firstChild, className);
                expect(jQuery(form.firstChild).attr("class")).to.be.equal(className);
            });

        });

        describe("# removeClass()", function () {

            it("should not have a class '" + className + "'", function () {
                jQuery(form.firstChild).addClass(className);
                domAdapter.removeClass(form.firstChild, className);
                expect(jQuery(form.firstChild).attr("class")).to.be.equal("");
            });
        });

        describe("# hasClass()", function () {

            it("should have the class '" + className + "'", function () {
                jQuery(form.firstChild).addClass(className);
                expect(domAdapter.hasClass(form.firstChild, className)).to.be.ok();
            });

        });

    });

    describe("Destroy & Dispose", function () {

        describe("# destroy()", function () {

            it("should remove the element from DOMElement", function () {
                var inputA = jQuery(form).find("[data-node='child-input-a']")[0];

                domAdapter.destroy(inputA);
                expect(jQuery(form).find("[data-node='child-input-a']")[0]).to.be.equal(undefined);
            });

            //If you destroy an element from a DOMNode and you keep the reference to it, it should be still able to
            //append it somewhere else with all its events.
            it("should still listen to events if you trigger them explicitly on the removed element", function (done) {
                var inputA = jQuery(form).find("[data-node='child-input-a']")[0];

                domAdapter.on(inputA, "click", function () {
                    done();
                });

                domAdapter.destroy(inputA);

                jQuery(inputA).trigger("click");
            });

        });

        describe("# dispose()", function () {

            it("should remove the element form DOMElemet like #destroy", function () {
                var inputA = jQuery(form).find("[data-node='child-input-a']")[0];

                domAdapter.dispose(inputA);
                expect(jQuery(form).find("[data-node='child-input-a']")[0]).to.be.equal(undefined);
            });

            it("should not listen to any event anymore even if it is triggered explicitly", function (done) {
                var inputA = jQuery(form).find("[data-node='child-input-a']")[0];

                domAdapter.on(inputA, "click", function () {
                    done();
                });

                domAdapter.on(inputA, "blur", function () {
                    done();
                });

                domAdapter.destroy(inputA);

                jQuery(inputA).trigger("click");
                jQuery(inputA).trigger("blur");

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