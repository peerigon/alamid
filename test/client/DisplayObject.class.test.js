"use strict";

var expect = require("expect.js"),
    CONSTANTS = require("../../lib/client/CONSTANTS.js"),
    path = require("path"),
    compile = require("nodeclass").compile,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    DisplayObjectExample = require("./mocks/DisplayObjectExample.class.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js");

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

        displayObject = new DisplayObjectExample(formTemplate);
        submitButtonDisplayObject = new DisplayObjectExample(submitButtonTemplate);
        formDisplayObject = new DisplayObjectExample(formTemplate);
    });

    describe(".construct()", function () {

        it("should throw an error if no template is given", function () {
            expect(function () { var dO = new DisplayObject(); }).to.throwError();
        });

        it("should be possible to declare template in a Class which inherits from DisplayObject", function (done) {
            displayObject = new DisplayObjectExample(); //Declares template via $template
            done();
        });

    });

    describe(".getNode()", function () {

        it("should return an node according to given template", function () {
            expect(displayObject.getNode().toString()).to.be.equal("[object HTMLFormElement]");
        });

    });

    describe(".getNodeMap()", function () {

        it("should return an object", function () {
            expect(typeof displayObject.getNodeMap()).to.be.equal("object");
        });

        it("should return a map of nodes including a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodeMap = displayObject.getNodeMap();

            expect(nodeMap.form.toString()).to.be.equal("[object HTMLFormElement]");
            expect(nodeMap["input-a"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
            expect(nodeMap["input-c"].toString()).to.be.equal("[object HTMLInputElement]");
        });

    });

    describe("._append()", function () {

        it("should throw an Error if an object not kind of DisplayObject is given", function () {
            expect(function () {
                formDisplayObject.append({});
            }).to.throwError();
        });

    });

    describe("._append().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject.append(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayObject.append(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayObject.on("beforeAdd", function () {
               done();
           });

           formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayObject.on("add", function () {
                done();
            });

            formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should append submit-button to form", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");

            var $lastChild = jQuery(formDisplayObject.getNode()).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be.equal(submitButtonDisplayObject.getNode().toString());
            expect($lastChild.val()).to.be.equal(submitButtonDisplayObject.getNode().value);
        });

    });

    describe("._prepend()", function () {
        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject.prepend(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });
    });

    describe("._prepend().at()", function () {


        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject.prepend(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayObject.prepend(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should emit an 'beforeAdd'-Event", function (done) {
            submitButtonDisplayObject.on("beforeAdd", function () {
                done();
            });

            formDisplayObject.prepend(submitButtonDisplayObject).at("form");
        });

        it("should emit an 'add'-Event", function (done) {
            submitButtonDisplayObject.on("add", function () {
                done();
            });

            formDisplayObject.prepend(submitButtonDisplayObject).at("form");
        });

        it("should prepend submit-button to form", function () {
            formDisplayObject.prepend(submitButtonDisplayObject).at("form");

            var $firstChild = jQuery(formDisplayObject.getNode()).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be.equal(submitButtonDisplayObject.getNode().toString());
            expect($firstChild.val()).to.be.equal(submitButtonDisplayObject.getNode().value);
        });

    });

    describe("._addNodeEvents()", function () {

        it("should throw an Error if you try to attach events to a not existing node", function () {
            expect(function () {
                displayObject.addNodeEvents({
                    "not_existing_node": {
                        "click": function () {
                            //do nothing
                        }
                    }
                });
            }).to.throwError();
        });

        it("should attach Events to nodes", function () {
            var focusEvent = "untriggred",
                blurEvent = "untriggered",
                $inputA = jQuery(formDisplayObject.getNode()).find("[data-node='input-a']"),
                $inputB = jQuery(formDisplayObject.getNode()).find("[data-node='input-b']");

            formDisplayObject.addNodeEvents({
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
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            expect(jQuery(formDisplayObject.getNode()).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after .destroy()", function (done) {
            submitButtonDisplayObject.addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            formDisplayObject.append(submitButtonDisplayObject).at("form");

            submitButtonDisplayObject.destroy();

            jQuery(submitButtonDisplayObject.getNode()).click();
        });

        it("should be possible to re-append a destroyed DisplayObject", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            formDisplayObject.append(submitButtonDisplayObject).at("form");

            expect(
                jQuery(formDisplayObject.getNode()).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButtonDisplayObject.getNode().toString());
        });

    });

    describe(".dispose()", function () {

        beforeEach(function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should NOT return a reference to itself", function () {
            expect(submitButtonDisplayObject.dispose()).to.be(undefined);
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
            expect(jQuery(formDisplayObject.getNode()).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be NOT possible to get a node", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.getNode()).to.not.be.ok();
        });

        it("should be NOT possible to get a map of nodes", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.getNodeMap()).to.not.be.ok();
        });

        it("should be NOT possible to trigger before attached events after .dispose()", function (done) {
            submitButtonDisplayObject.addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            submitButtonDisplayObject.dispose();

            jQuery(submitButtonDisplayObject.getNode()).click();

            done();
        });

        it("should be NOT possible to re-append a disposed DisplayObject", function () {
            submitButtonDisplayObject.dispose();

            expect(function () {
                formDisplayObject.append(submitButtonDisplayObject).at("form");
            }).to.be.throwError();
        });

        it("should be callable multiple times", function (done) {
            submitButtonDisplayObject.dispose();
            submitButtonDisplayObject.dispose();
            done();
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

    });

    describe(".hide()", function () {

        it("node should have the attribute class with at least " + CONSTANTS.HIDE_CLASS + " as value", function () {
            displayObject.hide();
            expect(jQuery(displayObject.getNode()).hasClass(CONSTANTS.HIDE_CLASS)).to.be(true);
        });
    });

    describe(".display()", function () {

        it("node should NOT have the attribute class with " + CONSTANTS.HIDE_CLASS + " as value", function () {
            displayObject.display();
            expect(jQuery(displayObject.getNode()).hasClass(CONSTANTS.HIDE_CLASS)).to.be(false);
        });

    });

    describe(".isDisplayed()", function () {

        it("should be true by default value", function () {
            expect(displayObject.isDisplayed()).to.be(true);
        });

        it("should be false after .hide()", function () {
            displayObject.hide();
            expect(displayObject.isDisplayed()).to.be(false);
        });

        it("should be true after .hide() and then .display()", function () {
            displayObject.hide();
            displayObject.display();
            expect(displayObject.isDisplayed()).to.be(true);
        });

    });

    describe(".isChild()", function () {

        var formDisplayObject,
            submitButtonDisplayObject;

        beforeEach(function () {
            formDisplayObject = new DisplayObjectExample(formTemplate);
            submitButtonDisplayObject = new DisplayObjectExample(submitButtonTemplate);

            formDisplayObject.append(submitButtonDisplayObject).at("form");
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