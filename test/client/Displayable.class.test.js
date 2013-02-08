"use strict";

var expect = require("expect.js"),
    value = require("value"),
    path = require("path"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    Plugins = require("../../lib/shared/Plugins.mixin.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js"),
    jQuery = require("../../lib/client/helpers/jQuery.js");

describe("Displayable", function () {

    var $form,
        form,
        formTemplate = DOMNodeMocks.getFormString(),
        $submitButton,
        submitButton,
        displayable,
        cssClassHide = Displayable.prototype.cssClassHide;

    beforeEach(function () {
        $form = jQuery(DOMNodeMocks.getForm());

        $submitButton = jQuery(DOMNodeMocks.getSubmitButton());

        displayable = new Displayable(formTemplate);
        submitButton = new Displayable(DOMNodeMocks.getSubmitButtonString());
        form = new Displayable(formTemplate);
    });

    describe(".constructor()", function () {
        var MyDisplayable = Displayable.extend({
                template: "<p></p>"
            });

        it("should throw an error if a template with more than one parent node is given", function () {
            expect(function () {
                var displayable = new Displayable("<p></p><div></div>");
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

            expect(nodeMap.form).to.be.an(HTMLFormElement);
            expect(nodeMap["input-a"]).to.be.an(HTMLInputElement);
            expect(nodeMap["input-c"]).to.be.an(HTMLInputElement);
            expect(nodeMap["input-c"]).to.be.an(HTMLInputElement);
        });

    });

    describe("._append().at()", function () {

        it("should throw an Error if an object not kind of Displayable is given", function () {
            expect(function () {
                form._append({}).at("form");
            }).to.throwError();
        });

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form._append(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form._append(submitButton).at("form")).to.be(form);
        });

        it("should append submit-button to form", function () {
            form._append(submitButton).at("form");

            var $lastChild = jQuery(form.node).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be(submitButton.node.toString());
            expect($lastChild.val()).to.be(submitButton.node.value);
        });

    });

    describe("._prepend()", function () {
        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form._prepend(submitButton).at("not_existing_node");
            }).to.throwError();
        });
    });

    describe("._prepend().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form._prepend(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form._prepend(submitButton).at("form")).to.be.equal(form);
        });

        it("should prepend submit-button to form", function () {
            form._prepend(submitButton).at("form");

            var $firstChild = jQuery(form.node).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be.equal(submitButton.node.toString());
            expect($firstChild.val()).to.be.equal(submitButton.node.value);
        });

    });

    describe("._addNodeEvents()", function () {

        it("should attach Events to nodes", function () {
            var focusEvent = "untriggered",
                blurEvent = "untriggered",
                $inputA = jQuery(form.node).find("[data-node='input-a']"),
                $inputB = jQuery(form.node).find("[data-node='input-b']");

            form._addNodeEvents({
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
            var $inputA = jQuery(form.node).find("[data-node='input-a']");

            form._onInputAFocus = function(event) {
                expect(this).to.be(form);
                expect(jQuery(event.target).attr("data-node")).to.equal($inputA.attr("data-node"));
                done();
            };

            form._addNodeEvents({
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

    describe(".unhinge()", function () {

        it("should return a reference to itself", function () {
            expect(submitButton.unhinge()).to.be.equal(submitButton);
        });

        it("should emit a 'unhinge'-Event", function (done) {
            submitButton.on("unhinge", function () {
                done();
            });

            submitButton.unhinge();
        });

        it("should be possible to call .unhinge() on an unhinged displayable without error", function () {
            submitButton.unhinge();
            submitButton.unhinge();
            submitButton.unhinge();
        });

        it("should unhinge itself from parent node", function () {
            form._append(submitButton).at("form");
            submitButton.unhinge();
            expect(jQuery(form.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after .unhinge()", function (done) {
            submitButton._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            form._append(submitButton).at("form");
            submitButton.unhinge();
            jQuery(submitButton.node).click();
        });

        it("should be possible to re-append a destroyed Displayable", function () {
            form._append(submitButton).at("form");
            submitButton.unhinge();
            form._append(submitButton).at("form");

            expect(
                jQuery(form.node).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButton.node.toString());
        });

    });

    describe(".dispose()", function () {

        beforeEach(function () {
            form._append(submitButton).at("form");
        });

        it("should NOT return a reference to itself", function () {
            expect(submitButton.dispose()).to.be(undefined);
        });

        it("should emit an 'unhinge'-Event before it disposes itself when it's a child displayable", function (done) {
            form._append(submitButton).at("form");
            submitButton.on("unhinge", function onUnhinge() {
                done();
            });
            submitButton.dispose();
        });

        it("should emit an 'dispose'-Event", function (done) {
            submitButton.on("dispose", function () {
                done();
            });
            submitButton.dispose();
        });

        it("should unhinge itself from parent node", function () {
            submitButton.dispose();
            expect(jQuery(form.node).find("[type='submit']").length).to.be.equal(0);
        });

        it("should NOT be possible to get a node", function () {
            submitButton.dispose();
            expect(submitButton.node).to.not.be.ok();
        });

        it("should NOT be possible to get a map of nodes", function () {
            submitButton.dispose();
            expect(submitButton._nodeMap).to.not.be.ok();
        });

        it("should NOT be possible to trigger before attached events after .dispose()", function (done) {
            submitButton._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done(); //Should not be executed
                    }
                }
            });

            submitButton.dispose();
            jQuery(submitButton.node).click();
            done();
        });

        it("should NOT be possible to re-append a disposed Displayable", function () {
            submitButton.dispose();

            expect(function () {
                form._append(submitButton).at("form");
            }).to.be.throwError();
        });

        it("should be callable multiple times", function () {
            submitButton.dispose();
            submitButton.dispose();
        });

        it("should emit 'destroy'-Event if .dispose() is called only on first call", function (done) {
            submitButton.on("unhinge", function beforeDispose() {
                done();
            });
            submitButton.dispose();

            submitButton.on("unhinge", function beforeDispose() {
                done(); //Should not be called
            });
            submitButton.dispose();
        });

        it("should emit 'dispose'-Event if .dispose() is called only on first call", function (done) {
            submitButton.on("dispose", function dispose() {
                done();
            });
            submitButton.dispose();

            submitButton.on("dispose", function dispose() {
                done(); //Should not be called
            });
            submitButton.dispose();
        });

        it("should dispose form and child Displayables", function () {
            var tmpDisplayable = new Displayable("<div data-node='child'></div>");

            tmpDisplayable._append(form);

            form.dispose();

            expect(jQuery(tmpDisplayable.node).children()).to.have.length(0);
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

        var form,
            submitBtn;

        beforeEach(function () {
            form = new Displayable(formTemplate);
            submitBtn = new Displayable("<input data-node='submit-button' type='submit' value='submit'/>");

            form._append(submitBtn).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(form.isChild()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitBtn.isChild()).to.be(true);
        });

        it("should be false after .unhinge()", function () {
            submitBtn.unhinge();
            expect(submitBtn.isChild()).to.be(false);
        });

        it("should be false after .dispose()", function () {
            submitBtn.dispose();
            expect(submitBtn.isChild()).to.be(false);
        });
    });

    /*
    describe("Plugins", function () {
        it("should implement the Plugins-mixin", function () {
            expect(Displayable.prototype.hook).to.be(Plugins.prototype.hook);
            expect(Displayable.prototype.runHook).to.be(Plugins.prototype.runHook);
            expect(Displayable.prototype.plugin).to.be(Plugins.prototype.plugin);
        });
        it("should be possible to define plugins via a plugins-array", function () {
            var aCalled = false,
                MyDisplayable = Displayable.extend({
                    plugins: [{
                        a: function () {
                            aCalled = true;
                        }
                    }]
                }),
                myDisplayable;

            myDisplayable = new MyDisplayable();
            myDisplayable.runHook("a");
            expect(aCalled).to.be(true);
        });
    });

    describe("Hooks", function () {
        var myDisplayable;

        it("should run a hook on 'beforeInit' and on 'init'", function (done) {
            var beforeInitCalled = false,
                initCalled = false,
                MyDisplayable = Displayable.extend({
                    constructor: function () {
                        this.hook("beforeInit", beforeInit);
                        this.hook("init", init);
                        this._super();
                        expect(beforeInitCalled).to.be(true);
                        expect(initCalled).to.be(true);
                        done();
                    }
                });

            function beforeInit(self) {
                beforeInitCalled = true;
                expect(self).to.be(this);
                expect(self._nodeMap).to.be(null);
                expect(self._children).to.be(null);
            }

            function init(self) {
                initCalled = true;
                expect(self).to.be(this);
                expect(self._nodeMap).to.be.an(Object);
                expect(self._children).to.be.an(Array);
                expect(self.node).to.be.a(HTMLDivElement);
            }

            myDisplayable = new MyDisplayable();
        });

        it("should run a hook on 'beforeParent' and 'parent'", function () {
            var beforeParentCalled = false,
                parentCalled = false,
                displayable = new Displayable('<div data-node="root"></div>'),
                childDisplayable = new Displayable();

            function beforeParent(self, parentDisplayable) {
                beforeParentCalled = true;
                expect(self).to.be(childDisplayable);
                expect(parentDisplayable).to.be(displayable);
            }

            function parent(self, parentDisplayable) {
                parentCalled = true;
                expect(self).to.be(childDisplayable);
                expect(parentDisplayable).to.be(displayable);
            }

            childDisplayable.hook("beforeParent", beforeParent);
            childDisplayable.hook("parent", parent);
            displayable._append(childDisplayable).at("root");

            expect(beforeParentCalled).to.be(true);
            expect(parentCalled).to.be(true);
        });
    });
    */
});