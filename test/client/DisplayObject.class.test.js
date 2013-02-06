"use strict";

var expect = require("expect.js"),
    value = require("value"),
    path = require("path"),
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js"),
    cssClassHide = DisplayObject.prototype.cssClassHide,
    jQuery = require("../../lib/client/helpers/jQuery.js");

describe("DisplayObject", function () {

    var $form,
        form,
        formTemplate = DOMNodeMocks.getFormString(),

        $submitButton,
        submitButton,
        submitButtonTemplate = DOMNodeMocks.getSubmitButtonString(),

        displayObject,
        formDisplayObject,
        submitButtonDisplayObject;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);

        submitButton = DOMNodeMocks.getSubmitButton();
        $submitButton = jQuery(submitButton);

        displayObject = new DisplayObject(formTemplate);
        submitButtonDisplayObject = new DisplayObject(submitButtonTemplate);
        formDisplayObject = new DisplayObject(formTemplate);
    });

    describe(".constructor()", function () {
        var MyDisplayObject = DisplayObject.extend({
                template: "<p></p>"
            });

        it("should throw an error if a template with more than one parent node is given", function () {
            expect(function () {
                var dO = new DisplayObject("<p></p><div></div>");
            }).to.throwError();
        });

        it("should apply the passed template in favor of the DisplayObject's template", function () {
            var myDisplayObject = new MyDisplayObject("<em></em>");

            expect(myDisplayObject.template).to.be("<em></em>");
        });

        it("should apply the DisplayObject's template if no template was passed", function () {
            var myDisplayObject = new MyDisplayObject();

            expect(myDisplayObject.template).to.be(MyDisplayObject.prototype.template);
        });

        it("should apply '<div></div>' as default template if nothing has been passed", function () {
            var myDisplayObject = new DisplayObject();

            expect(myDisplayObject.template).to.be(DisplayObject.prototype.template);
        });
    });

    describe(".node", function () {
        it("should return an node according to given template", function () {
            expect(displayObject.node.toString()).to.be.equal("[object HTMLFormElement]");
        });
    });

    describe("._nodeMap", function () {

        it("should return an object", function () {
            expect(displayObject._nodeMap).to.be.an(Object);
        });

        it("should return a map of nodes including a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodeMap = displayObject._nodeMap;

            expect(nodeMap.form.toString()).to.be.equal("[object HTMLFormElement]");
            expect(nodeMap["input-a"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
        });

    });

    describe("._append()", function () {

        it("should throw an Error if an object not kind of DisplayObject is given", function () {
            expect(function () {
                formDisplayObject._append({});
            }).to.throwError();
        });

    });

    describe("._append().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject._append(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayObject._append(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayObject.on("beforeAdd", function () {
                done();
            });

            formDisplayObject._append(submitButtonDisplayObject).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayObject.on("add", function () {
                done();
            });

            formDisplayObject._append(submitButtonDisplayObject).at("form");
        });

        it("should append submit-button to form", function () {
            formDisplayObject._append(submitButtonDisplayObject).at("form");

            var $lastChild = jQuery(formDisplayObject.node).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be.equal(submitButtonDisplayObject.node.toString());
            expect($lastChild.val()).to.be.equal(submitButtonDisplayObject.node.value);
        });

    });

    describe("._prepend()", function () {
        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject._prepend(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });
    });

    describe("._prepend().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject._prepend(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayObject._prepend(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayObject.on("beforeAdd", function () {
                done();
            });

            formDisplayObject._prepend(submitButtonDisplayObject).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayObject.on("add", function () {
                done();
            });

            formDisplayObject._prepend(submitButtonDisplayObject).at("form");
        });

        it("should prepend submit-button to form", function () {
            formDisplayObject._prepend(submitButtonDisplayObject).at("form");

            var $firstChild = jQuery(formDisplayObject.node).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be.equal(submitButtonDisplayObject.node.toString());
            expect($firstChild.val()).to.be.equal(submitButtonDisplayObject.node.value);
        });

    });

    describe("._addNodeEvents()", function () {

        it("should throw an Error if you try to attach events to a not existing node", function () {
            expect(function () {
                displayObject._addNodeEvents({
                    "not_existing_node": {
                        "click": function () {
                            //do nothing
                        }
                    }
                });
            }).to.throwError();
        });

        it("should attach Events to nodes", function () {
            var focusEvent = "untriggered",
                blurEvent = "untriggered",
                $inputA = jQuery(formDisplayObject.node).find("[data-node='input-a']"),
                $inputB = jQuery(formDisplayObject.node).find("[data-node='input-b']");

            formDisplayObject._addNodeEvents({
                "input-a": {
                    "focus": function () {
                        focusEvent = "triggered";
                    }
                },
                "input-b": {
                    "blur": function () {
                        blurEvent = "triggered";
                    }
                }
            });

            $inputA.focus();
            $inputB.blur();

            expect(focusEvent).to.be.equal("triggered");
            expect(blurEvent).to.be.equal("triggered");
        });

        it("should call the handlers bound to the view if defined as string", function(done) {
            var $inputA = jQuery(formDisplayObject.node).find("[data-node='input-a']");

            formDisplayObject._onInputAFocus = function(event) {
                expect(this).to.be(formDisplayObject);
                expect(jQuery(event.target).attr("data-node")).to.equal($inputA.attr("data-node"));
                done();
            };

            formDisplayObject._addNodeEvents({
                "input-a": {
                    focus : "_onInputAFocus"
                }
            });

            $inputA.focus();
        });

        it("should call _addNodeEvents automatically if an events-attribute is defined", function(done) {
            var MyDisplayObject = DisplayObject.extend({
                events : {
                    "input-a": {
                        focus : "_onInputAFocus"
                    }
                },
                _addNodeEvents : function() {
                    done();
                }
            });

            var myDisplayObject = new MyDisplayObject(formTemplate);
        });
    });

    describe(".destroy()", function () {

        it("should return a reference to itself", function () {
            expect(submitButtonDisplayObject.destroy()).to.be.equal(submitButtonDisplayObject);
        });

        it("should emit a 'beforeDestroy'-Event", function (done) {
            submitButtonDisplayObject.on("beforeDestroy", function () {
                done();
            });

            submitButtonDisplayObject.destroy();
        });

        it("should emit a 'destroy'-Event", function (done) {
            submitButtonDisplayObject.on("destroy", function () {
                done();
            });

            submitButtonDisplayObject.destroy();
        });

        it("should remove itself from parent node", function () {
            formDisplayObject._append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            expect(jQuery(formDisplayObject.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after .destroy()", function (done) {
            submitButtonDisplayObject._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            formDisplayObject._append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            jQuery(submitButtonDisplayObject.node).click();
        });

        it("should be possible to re-append a destroyed DisplayObject", function () {
            formDisplayObject._append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            formDisplayObject._append(submitButtonDisplayObject).at("form");

            expect(
                jQuery(formDisplayObject.node).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButtonDisplayObject.node.toString());
        });

    });

    describe(".dispose()", function () {

        beforeEach(function () {
            formDisplayObject._append(submitButtonDisplayObject).at("form");
        });

        it("should NOT return a reference to itself", function () {
            expect(submitButtonDisplayObject.dispose()).to.be(undefined);
        });

        it("should emit 'beforeDestroy'-Event before it disposes itself", function (done) {
            submitButtonDisplayObject.on("beforeDestroy", function onBeforeDestroy() {
                done();
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit 'destroy'-Event before it disposes itself", function (done) {
            submitButtonDisplayObject.on("destroy", function onDestroy() {
                done();
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit an 'beforeDispose'-Event", function (done) {
            submitButtonDisplayObject.on("beforeDispose", function () {
                done();
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit an 'dispose'-Event", function (done) {
            submitButtonDisplayObject.on("dispose", function () {
                done();
            });
            submitButtonDisplayObject.dispose();
        });

        it("should remove itself from parent node", function () {
            submitButtonDisplayObject.dispose();
            expect(jQuery(formDisplayObject.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should NOT be possible to get a node", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.node).to.not.be.ok();
        });

        it("should NOT be possible to get a map of nodes", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject._nodeMap).to.not.be.ok();
        });

        it("should NOT be possible to trigger before attached events after .dispose()", function (done) {
            submitButtonDisplayObject._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done(); //Should not be executed
                    }
                }
            });

            submitButtonDisplayObject.dispose();
            jQuery(submitButtonDisplayObject.node).click();
            done();
        });

        it("should NOT be possible to re-append a disposed DisplayObject", function () {
            submitButtonDisplayObject.dispose();

            expect(function () {
                formDisplayObject._append(submitButtonDisplayObject).at("form");
            }).to.be.throwError();
        });

        it("should be callable multiple times", function () {
            submitButtonDisplayObject.dispose();
            submitButtonDisplayObject.dispose();
        });

        it("should emit 'beforeDestroy'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayObject.on("beforeDestroy", function beforeDispose() {
                done();
            });
            submitButtonDisplayObject.dispose();

            submitButtonDisplayObject.on("beforeDestroy", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit 'destroy'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayObject.on("destroy", function beforeDispose() {
                done();
            });
            submitButtonDisplayObject.dispose();

            submitButtonDisplayObject.on("destroy", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit 'beforeDispose'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayObject.on("beforeDispose", function beforeDispose() {
                done();
            });
            submitButtonDisplayObject.dispose();

            submitButtonDisplayObject.on("beforeDispose", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayObject.dispose();
        });

        it("should emit 'dispose'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayObject.on("dispose", function dispose() {
                done();
            });
            submitButtonDisplayObject.dispose();

            submitButtonDisplayObject.on("dispose", function dispose() {
                done(); //Should not be called
            });
            submitButtonDisplayObject.dispose();
        });

        it("should dispose form and child DisplayObjects", function () {
            var tmpDisplayObject = new DisplayObject("<div data-node='child'></div>");

            tmpDisplayObject._append(formDisplayObject);

            formDisplayObject.dispose();

            expect(jQuery(tmpDisplayObject.node).children().length).to.equal(0);
        });

    });

    describe(".hide()", function () {

        it("node should have the attribute class with at least " + cssClassHide + " as value", function () {
            displayObject.hide();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(true);
        });

    });

    describe(".show()", function () {

        it("node should NOT have the attribute class with " + cssClassHide + " as value", function () {
            displayObject.show();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(false);
        });

    });

    describe(".toggle()", function () {

        it("node should hide if already shown", function () {
            displayObject.show();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(false);
            displayObject.toggle();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(true);
        });

        it("node should show if been hidden", function () {
            displayObject.hide();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(true);
            displayObject.toggle();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(false);
        });

        it("node should force show if called with (true)", function () {
            displayObject.show();
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(false);
            displayObject.toggle(true);
            expect(jQuery(displayObject.node).hasClass(cssClassHide)).to.be(false);
        });

        it("should not emit an event if the state hasn't changed", function() {
            var eventCnt = 0;

            displayObject.hide();

            displayObject.on("show", function() {
                eventCnt++;
            });

            displayObject.show();
            displayObject.show();
            displayObject.show();

            expect(eventCnt).to.be(1);
        });
    });

    describe(".isVisible()", function () {

        it("should be true by default value", function () {
            expect(displayObject.isVisible()).to.be(true);
        });

        it("should be false after .hide()", function () {
            displayObject.hide();
            expect(displayObject.isVisible()).to.be(false);
        });

        it("should be true after .hide() and then .show()", function () {
            displayObject.hide();
            displayObject.show();
            expect(displayObject.isVisible()).to.be(true);
        });

    });

    describe(".isChild()", function () {

        var formDisplayObject,
            submitButtonDisplayObject;

        beforeEach(function () {
            formDisplayObject = new DisplayObject(formTemplate);
            submitButtonDisplayObject = new DisplayObject(submitButtonTemplate);

            formDisplayObject._append(submitButtonDisplayObject).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(formDisplayObject.isChild()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitButtonDisplayObject.isChild()).to.be(true);
        });

        it("should be false after .destroy()", function () {
            submitButtonDisplayObject.destroy();
            expect(submitButtonDisplayObject.isChild()).to.be(false);
        });

        it("should be false after .dispose()", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.isChild()).to.be(false);
        });
    });
});