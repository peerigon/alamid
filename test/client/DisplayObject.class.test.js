"use strict";

var expect = require("expect.js"),
    STATICS = require("../../compiled/client/ALAMID_CLIENT_CONST.js"),
    path = require("path"),
    compile = require("nodeclass").compile,
    DisplayObject = require("../../compiled/client/DisplayObject.class.js"),
    ExtendedByDisplayObject = require("../../compiled/client/tmp/ExtendedByDisplayObject.class.js");

describe("DisplayObject", function () {

    describe("Construction", function () {

        describe("Errors", function () {

            it("should throw an error if no template is given", function () {
                expect(function () { var dO = new DisplayObject(); }).to.throwError();
            });

        });

    });

    describe("Methods", function () {

        var $form,
            form,
            formTemplate,
            displayObject;

        beforeEach(function () {
            form = DOMNodeMocks.getForm();
            $form = jQuery(form);
            formTemplate = DOMNodeMocks.getFormString();
            displayObject = new DisplayObject(formTemplate);
        });

        describe("# getNode()", function () {

            it("should be an [object HTMLFormElement]", function () {
                expect(displayObject.getNode().toString()).to.be.equal("[object HTMLFormElement]");
            });

        });

        describe("# getNodeMap()", function () {

            it("should return an object", function () {
                //expect(displayObject.getNodeMap()).to.be.an(Object);
            });

            it("should return a map of nodes with a 'form'-, 'child-input-a'-, 'child-input-b'-, 'child-input-c'- node ", function () {
                var nodeMap = displayObject.getNodeMap();

                expect(nodeMap.form.toString()).to.be.equal("[object HTMLFormElement]");
                expect(nodeMap["child-input-a"].toString() === "[object HTMLInputElement]").to.be(true);
                expect(nodeMap["child-input-c"].toString() === "[object HTMLInputElement]").to.be(true);
                expect(nodeMap["child-input-c"].toString() === "[object HTMLInputElement]").to.be(true);
            });

        });

        describe("# _append()", function () {

            var extendedByDisplayObject,
                submitButtonDisplayObject,
                submitButtonTemplate,
                submitButton,
                $submitButton;

            beforeEach(function () {

                submitButtonTemplate = DOMNodeMocks.getSubmitButtonString();
                submitButton = DOMNodeMocks.getSubmitButton();
                $submitButton = jQuery(submitButton);
                submitButtonDisplayObject = new ExtendedByDisplayObject(submitButtonTemplate);
                extendedByDisplayObject = new ExtendedByDisplayObject(formTemplate);
            });

            describe("Appending", function () {

                /*
                it("should accept any kind of DisplayObject", function () {
                    expect(function () {
                        extendedByDisplayObject.append(submitButtonDisplayObject);
                    }).not.to.throwError();
                });
                */

                it("should return an object providing a function at()", function () {
                    expect(extendedByDisplayObject.append(submitButtonDisplayObject).at).to.be.a(Function);
                });


            });

            describe("Errors", function () {

                /*
                it("should throw an Error if an object not kind of DisplayObject is given", function () {
                    expect(function () {
                        extendedByDisplayObject.append({});
                    }).to.throwException();
                });
                */

                it("should throw an Error if a not existent node name was passed to at()", function () {

                });

            });

        });

        describe("# destroy()", function () {

            it("should return a reference to itself", function () {
                expect(displayObject.destroy() === displayObject).to.be(true);
            });

        });

        describe("# dispose()", function () {

            it("should return a reference to itself", function () {
                expect(displayObject.dispose() === displayObject).to.be(true);
            });

        });

        describe("# hide()", function () {

            it("node should have the attribute class with at least " + STATICS.HIDE_CLASS + " as value", function () {
                displayObject.hide();
                expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(true);
            });
        });

        describe("# display()", function () {

            it("node should NOT have the attribute class with " + STATICS.HIDE_CLASS + " as value", function () {
                displayObject.display();
                expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(false);
            });

        });

        describe("# isDisplayed()", function () {

            it("should be true by default value", function () {
                expect(displayObject.isDisplayed()).to.be(true);
            });

            it("should be false after # hide()", function () {
                displayObject.hide();
                expect(displayObject.isDisplayed()).to.be(false);
            });

            it("should be true after # hide() and then # display()", function () {
                displayObject.hide();
                displayObject.display();
                expect(displayObject.isDisplayed()).to.be(true);
            });

        });

        describe("# isAppended()", function () {

            it("should be false by default (=just created and not appended anywhere)", function () {
                expect(displayObject.isAppended()).to.be(false);
            });

            it("should be true after appending it anywhere", function () {

            });

            it("should be false after # destroy()", function () {
                displayObject.isAppended();
                expect(displayObject.isAppended()).to.be(false);
            });

            it("should be false after # dispose()", function () {
                displayObject.isAppended();
                expect(displayObject.isAppended()).to.be(false);
            });
        });

        describe("# attachEvents()", function () {

            describe("Errors", function () {

                it("should throw an Error if you try to attach events to a not existing node", function () {

                    expect(function () {
                        displayObject.attachEvents({
                            "not_existing_node": {
                                "click": function () {
                                    //do nothing
                                }
                            }
                        });
                    }).to.throwError();
                });

            });

            describe("Attaching Events", function () {

                it("should attach the 'focus'-Event to 'child-input-a'-Node", function (done) {

                    var nodeMap = displayObject.getNodeMap();

                    displayObject.attachEvents({
                        "child-input-a": {
                            "focus": function () {
                                done();
                            }
                        }
                    });

                    jQuery(nodeMap["child-input-a"]).trigger("focus");

                });

            });

        });


    });

});