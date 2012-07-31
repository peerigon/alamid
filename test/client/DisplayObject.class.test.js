"use strict";

var expect = require("expect.js"),
    STATICS = require("../../lib/client/ALAMID_CLIENT_CONST.js"),
    path = require("path"),
    compile = require("nodeclass").compile,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    DisplayObjectExample = require("./mocks/DisplayObjectExample.class.js");

describe("DisplayObject", function () {

    var $form,
        form,
        formTemplate,

        $submitButton,
        submitButton,
        submitButtonTemplate,

        displayObject,
        formDisplayObject,
        submitButtonDisplayObject;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);
        formTemplate = DOMNodeMocks.getFormString();

        submitButton = DOMNodeMocks.getSubmitButton();
        $submitButton = jQuery(submitButton);
        submitButtonTemplate = DOMNodeMocks.getSubmitButtonString();


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

    describe(".append().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                formDisplayObject.append(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formDisplayObject.append(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should emit an 'beforeappend'-Event", function (done) {
            submitButtonDisplayObject.on("beforeappend", function () {
               done();
           });

           formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should emit an 'append'-Event", function (done) {
            submitButtonDisplayObject.on("append", function () {
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

        it("should emit a 'beforedestroy'-Event", function (done) {
            submitButtonDisplayObject.on("beforedestroy", function () {
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

        it("should emit an 'beforedispose'-Event", function (done) {
            submitButtonDisplayObject.on("beforedispose", function () {
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
    });

    describe(".hide()", function () {

        it("node should have the attribute class with at least " + STATICS.HIDE_CLASS + " as value", function () {
            displayObject.hide();
            expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(true);
        });
    });

    describe(".display()", function () {

        it("node should NOT have the attribute class with " + STATICS.HIDE_CLASS + " as value", function () {
            displayObject.display();
            expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(false);
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

    describe(".isAppended()", function () {

        var formDisplayObject,
            submitButtonDisplayObject;

        beforeEach(function () {
            formDisplayObject = new DisplayObjectExample(formTemplate);
            submitButtonDisplayObject = new DisplayObjectExample(submitButtonTemplate);

            formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(formDisplayObject.isAppended()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitButtonDisplayObject.isAppended()).to.be(true);
        });

        it("should be false after .destroy()", function () {
            submitButtonDisplayObject.destroy();
            expect(submitButtonDisplayObject.isAppended()).to.be(false);
        });

        it("should be false after .dispose()", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.isAppended()).to.be(false);
        });
    });
});