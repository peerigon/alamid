"use strict";

var expect = require("expect.js"),
    value = require("value"),
    path = require("path"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js"),
    cssClassHide = Displayable.prototype.cssClassHide,
    jQuery = require("../../lib/client/helpers/jQuery.js");

describe("Displayable", function () {

    var $form,
        form,
        formTemplate = DOMNodeMocks.getFormString(),

        $submitButton,
        submitButton,
        submitButtonTemplate = DOMNodeMocks.getSubmitButtonString(),

        displayable,
        formDisplayable,
        submitButtonDisplayable;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);

        submitButton = DOMNodeMocks.getSubmitButton();
        $submitButton = jQuery(submitButton);

        displayable = new Displayable(formTemplate);
        submitButtonDisplayable = new Displayable(submitButtonTemplate);
        formDisplayable = new Displayable(formTemplate);
    });

    describe(".constructor()", function () {
        var MyDisplayable = Displayable.extend({
                template: "<p></p>"
            });

        it("should throw an error if a template with more than one parent node is given", function () {
            expect(function () {
                var dO = new Displayable("<p></p><div></div>");
            }).to.throwError();
        });

        it("should apply the passed template in favor of the Displayable's template", function () {
            var myDisplayable = new MyDisplayable("<em></em>");

            expect(myDisplayable.template).to.be("<em></em>");
        });

        it("should apply the Displayable's template if no template was passed", function () {
            var myDisplayable = new MyDisplayable();

            expect(myDisplayable.template).to.be(MyDisplayable.prototype.template);
        });

        it("should apply '<div></div>' as default template if nothing has been passed", function () {
            var myDisplayable = new Displayable();

            expect(myDisplayable.template).to.be(Displayable.prototype.template);
        });
    });

    describe(".node", function () {
        it("should return an node according to given template", function () {
            expect(displayable.node.toString()).to.be.equal("[object HTMLFormElement]");
        });
    });

    describe("._nodeMap", function () {

        it("should return an object", function () {
            expect(displayable._nodeMap).to.be.an(Object);
        });

        it("should return a map of nodes including a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodeMap = displayable._nodeMap;

            expect(nodeMap.form.toString()).to.be.equal("[object HTMLFormElement]");
            expect(nodeMap["input-a"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
        });

    });

    describe("._append()", function () {

        it("should throw an Error if an object not kind of Displayable is given", function () {
            expect(function () {
                formDisplayable._append({});
            }).to.throwError();
        });

    });

    describe("._append().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayable._append(submitButtonDisplayable).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayable._append(submitButtonDisplayable).at("form")).to.be.equal(formDisplayable);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayable.on("beforeAdd", function () {
                done();
            });

            formDisplayable._append(submitButtonDisplayable).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayable.on("add", function () {
                done();
            });

            formDisplayable._append(submitButtonDisplayable).at("form");
        });

        it("should append submit-button to form", function () {
            formDisplayable._append(submitButtonDisplayable).at("form");

            var $lastChild = jQuery(formDisplayable.node).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be.equal(submitButtonDisplayable.node.toString());
            expect($lastChild.val()).to.be.equal(submitButtonDisplayable.node.value);
        });

    });

    describe("._prepend()", function () {
        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayable._prepend(submitButtonDisplayable).at("not_existing_node");
            }).to.throwError();
        });
    });

    describe("._prepend().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayable._prepend(submitButtonDisplayable).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayable._prepend(submitButtonDisplayable).at("form")).to.be.equal(formDisplayable);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayable.on("beforeAdd", function () {
                done();
            });

            formDisplayable._prepend(submitButtonDisplayable).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayable.on("add", function () {
                done();
            });

            formDisplayable._prepend(submitButtonDisplayable).at("form");
        });

        it("should prepend submit-button to form", function () {
            formDisplayable._prepend(submitButtonDisplayable).at("form");

            var $firstChild = jQuery(formDisplayable.node).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be.equal(submitButtonDisplayable.node.toString());
            expect($firstChild.val()).to.be.equal(submitButtonDisplayable.node.value);
        });

    });

    describe("._addNodeEvents()", function () {

        it("should throw an Error if you try to attach events to a not existing node", function () {
            expect(function () {
                displayable._addNodeEvents({
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
                $inputA = jQuery(formDisplayable.node).find("[data-node='input-a']"),
                $inputB = jQuery(formDisplayable.node).find("[data-node='input-b']");

            formDisplayable._addNodeEvents({
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
            var $inputA = jQuery(formDisplayable.node).find("[data-node='input-a']");

            formDisplayable._onInputAFocus = function(event) {
                expect(this).to.be(formDisplayable);
                expect(jQuery(event.target).attr("data-node")).to.equal($inputA.attr("data-node"));
                done();
            };

            formDisplayable._addNodeEvents({
                "input-a": {
                    focus : "_onInputAFocus"
                }
            });

            $inputA.focus();
        });

        it("should call _addNodeEvents automatically if an events-attribute is defined", function(done) {
            var MyDisplayable = Displayable.extend({
                events : {
                    "input-a": {
                        focus : "_onInputAFocus"
                    }
                },
                _addNodeEvents : function() {
                    done();
                }
            });

            var myDisplayable = new MyDisplayable(formTemplate);
        });
    });

    describe(".destroy()", function () {

        it("should return a reference to itself", function () {
            expect(submitButtonDisplayable.destroy()).to.be.equal(submitButtonDisplayable);
        });

        it("should emit a 'beforeDestroy'-Event", function (done) {
            submitButtonDisplayable.on("beforeDestroy", function () {
                done();
            });

            submitButtonDisplayable.destroy();
        });

        it("should emit a 'destroy'-Event", function (done) {
            submitButtonDisplayable.on("destroy", function () {
                done();
            });

            submitButtonDisplayable.destroy();
        });

        it("should remove itself from parent node", function () {
            formDisplayable._append(submitButtonDisplayable).at("form");
            submitButtonDisplayable.destroy();
            expect(jQuery(formDisplayable.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after .destroy()", function (done) {
            submitButtonDisplayable._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            formDisplayable._append(submitButtonDisplayable).at("form");
            submitButtonDisplayable.destroy();
            jQuery(submitButtonDisplayable.node).click();
        });

        it("should be possible to re-append a destroyed Displayable", function () {
            formDisplayable._append(submitButtonDisplayable).at("form");
            submitButtonDisplayable.destroy();
            formDisplayable._append(submitButtonDisplayable).at("form");

            expect(
                jQuery(formDisplayable.node).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButtonDisplayable.node.toString());
        });

    });

    describe(".dispose()", function () {

        beforeEach(function () {
            formDisplayable._append(submitButtonDisplayable).at("form");
        });

        it("should NOT return a reference to itself", function () {
            expect(submitButtonDisplayable.dispose()).to.be(undefined);
        });

        it("should emit 'beforeDestroy'-Event before it disposes itself", function (done) {
            submitButtonDisplayable.on("beforeDestroy", function onBeforeDestroy() {
                done();
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit 'destroy'-Event before it disposes itself", function (done) {
            submitButtonDisplayable.on("destroy", function onDestroy() {
                done();
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit an 'beforeDispose'-Event", function (done) {
            submitButtonDisplayable.on("beforeDispose", function () {
                done();
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit an 'dispose'-Event", function (done) {
            submitButtonDisplayable.on("dispose", function () {
                done();
            });
            submitButtonDisplayable.dispose();
        });

        it("should remove itself from parent node", function () {
            submitButtonDisplayable.dispose();
            expect(jQuery(formDisplayable.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should NOT be possible to get a node", function () {
            submitButtonDisplayable.dispose();
            expect(submitButtonDisplayable.node).to.not.be.ok();
        });

        it("should NOT be possible to get a map of nodes", function () {
            submitButtonDisplayable.dispose();
            expect(submitButtonDisplayable._nodeMap).to.not.be.ok();
        });

        it("should NOT be possible to trigger before attached events after .dispose()", function (done) {
            submitButtonDisplayable._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done(); //Should not be executed
                    }
                }
            });

            submitButtonDisplayable.dispose();
            jQuery(submitButtonDisplayable.node).click();
            done();
        });

        it("should NOT be possible to re-append a disposed Displayable", function () {
            submitButtonDisplayable.dispose();

            expect(function () {
                formDisplayable._append(submitButtonDisplayable).at("form");
            }).to.be.throwError();
        });

        it("should be callable multiple times", function () {
            submitButtonDisplayable.dispose();
            submitButtonDisplayable.dispose();
        });

        it("should emit 'beforeDestroy'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayable.on("beforeDestroy", function beforeDispose() {
                done();
            });
            submitButtonDisplayable.dispose();

            submitButtonDisplayable.on("beforeDestroy", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit 'destroy'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayable.on("destroy", function beforeDispose() {
                done();
            });
            submitButtonDisplayable.dispose();

            submitButtonDisplayable.on("destroy", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit 'beforeDispose'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayable.on("beforeDispose", function beforeDispose() {
                done();
            });
            submitButtonDisplayable.dispose();

            submitButtonDisplayable.on("beforeDispose", function beforeDispose() {
                done(); //Should not be called
            });
            submitButtonDisplayable.dispose();
        });

        it("should emit 'dispose'-Event if .dispose() is called only on first call", function (done) {
            submitButtonDisplayable.on("dispose", function dispose() {
                done();
            });
            submitButtonDisplayable.dispose();

            submitButtonDisplayable.on("dispose", function dispose() {
                done(); //Should not be called
            });
            submitButtonDisplayable.dispose();
        });

        it("should dispose form and child Displayables", function () {
            var tmpDisplayable = new Displayable("<div data-node='child'></div>");

            tmpDisplayable._append(formDisplayable);

            formDisplayable.dispose();

            expect(jQuery(tmpDisplayable.node).children().length).to.equal(0);
        });

    });

    describe(".hide()", function () {

        it("node should have the attribute class with at least " + cssClassHide + " as value", function () {
            displayable.hide();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(true);
        });

    });

    describe(".show()", function () {

        it("node should NOT have the attribute class with " + cssClassHide + " as value", function () {
            displayable.show();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(false);
        });

    });

    describe(".toggle()", function () {

        it("node should hide if already shown", function () {
            displayable.show();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(false);
            displayable.toggle();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(true);
        });

        it("node should show if been hidden", function () {
            displayable.hide();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(true);
            displayable.toggle();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(false);
        });

        it("node should force show if called with (true)", function () {
            displayable.show();
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(false);
            displayable.toggle(true);
            expect(jQuery(displayable.node).hasClass(cssClassHide)).to.be(false);
        });

        it("should not emit an event if the state hasn't changed", function() {
            var eventCnt = 0;

            displayable.hide();

            displayable.on("show", function() {
                eventCnt++;
            });

            displayable.show();
            displayable.show();
            displayable.show();

            expect(eventCnt).to.be(1);
        });
    });

    describe(".isVisible()", function () {

        it("should be true by default value", function () {
            expect(displayable.isVisible()).to.be(true);
        });

        it("should be false after .hide()", function () {
            displayable.hide();
            expect(displayable.isVisible()).to.be(false);
        });

        it("should be true after .hide() and then .show()", function () {
            displayable.hide();
            displayable.show();
            expect(displayable.isVisible()).to.be(true);
        });

    });

    describe(".isChild()", function () {

        var formDisplayable,
            submitButtonDisplayable;

        beforeEach(function () {
            formDisplayable = new Displayable(formTemplate);
            submitButtonDisplayable = new Displayable(submitButtonTemplate);

            formDisplayable._append(submitButtonDisplayable).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(formDisplayable.isChild()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitButtonDisplayable.isChild()).to.be(true);
        });

        it("should be false after .destroy()", function () {
            submitButtonDisplayable.destroy();
            expect(submitButtonDisplayable.isChild()).to.be(false);
        });

        it("should be false after .dispose()", function () {
            submitButtonDisplayable.dispose();
            expect(submitButtonDisplayable.isChild()).to.be(false);
        });
    });
});