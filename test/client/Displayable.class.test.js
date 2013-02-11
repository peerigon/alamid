"use strict";

var expect = require("expect.js"),
    value = require("value"),
    path = require("path"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    Plugins = require("../../lib/shared/Plugins.mixin.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),
    _ = require("underscore");

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
            var myDisplayable = new MyDisplayable("<ol></ol>");

            expect(myDisplayable.root).to.be.an(HTMLOListElement);
        });

        it("should apply the passed node in favor of the Displayable's template", function () {
            var ol = document.createElement("ol"),
                myDisplayable = new MyDisplayable(ol);

            expect(myDisplayable.root).to.be.an(HTMLOListElement);
        });

        it("should apply the Displayable's template if no template was passed", function () {
            var myDisplayable = new MyDisplayable();

            expect(myDisplayable.root).to.be.an(HTMLParagraphElement);
        });

        it("should apply '<div></div>' as default template if nothing has been passed", function () {
            var myDisplayable = new Displayable();

            expect(myDisplayable.root.outerHTML).to.be("<div></div>");
        });
    });

    describe(".root", function () {
        it("should return a root node according to given template", function () {
            expect(displayable.root).to.be.an(HTMLFormElement);
        });
    });

    describe(".nodes", function () {

        it("should return an object", function () {
            expect(displayable.nodes).to.be.an(Object);
        });

        it("should return a map of nodes including a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodes = displayable.nodes;

            expect(nodes.form).to.be.an(HTMLFormElement);
            expect(nodes["input-a"]).to.be.an(HTMLInputElement);
            expect(nodes["input-c"]).to.be.an(HTMLInputElement);
            expect(nodes["input-c"]).to.be.an(HTMLInputElement);
        });

    });

    describe(".append().at()", function () {

        it("should throw an Error if an object not kind of Displayable is given", function () {
            expect(function () {
                form.append({}).at("form");
            }).to.throwError();
        });

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form.append(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form.append(submitButton).at("form")).to.be(form);
        });

        it("should append submit-button to form", function () {
            form.append(submitButton).at("form");

            var $lastChild = jQuery(form.root).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be(submitButton.root.toString());
            expect($lastChild.val()).to.be(submitButton.root.value);
        });

    });

    describe(".prepend()", function () {
        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form.prepend(submitButton).at("not_existing_node");
            }).to.throwError();
        });
    });

    describe(".prepend().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form.prepend(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form.prepend(submitButton).at("form")).to.be.equal(form);
        });

        it("should prepend submit-button to form", function () {
            form.prepend(submitButton).at("form");

            var $firstChild = jQuery(form.root).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be.equal(submitButton.root.toString());
            expect($firstChild.val()).to.be.equal(submitButton.root.value);
        });

    });

    describe("._addNodeEvents()", function () {

        it("should attach Events to nodes", function () {
            var focusEvent = "untriggered",
                blurEvent = "untriggered",
                $inputA = jQuery(form.root).find("[data-node='input-a']"),
                $inputB = jQuery(form.root).find("[data-node='input-b']");

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
            var $inputA = jQuery(form.root).find("[data-node='input-a']");

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

    describe(".detach()", function () {

        it("should return a reference to itself", function () {
            expect(submitButton.detach()).to.be(submitButton);
        });

        it("should emit a 'detach'-event when it's actually detached", function (done) {
            form.append(submitButton).at("form");
            submitButton.on("detach", function () {
                done();
            });
            submitButton.detach();
        });

        it("should emit no 'detach'-event when it's not actually detached", function (done) {
            submitButton.on("detach", function () {
                done(); // this should not be called. mocha throws an error if done is called twice.
            });
            submitButton.detach();
            done();
        });

        it("should be possible to call .detach() on an detached displayable without error", function () {
            submitButton.detach();
            submitButton.detach();
            submitButton.detach();
        });

        it("should detach itself from parent node", function () {
            form.append(submitButton).at("form");
            submitButton.detach();
            expect(jQuery(form.root).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after .detach()", function (done) {
            submitButton._addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            form.append(submitButton).at("form");
            submitButton.detach();
            jQuery(submitButton.root).click();
        });

        it("should be possible to re-append a detached Displayable", function () {
            form.append(submitButton).at("form");
            submitButton.detach();
            form.append(submitButton).at("form");

            expect(
                jQuery(form.root).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButton.root.toString());
        });

    });

    describe(".dispose()", function () {

        beforeEach(function () {
            form.append(submitButton).at("form");
        });

        it("should NOT return a reference to itself", function () {
            expect(submitButton.dispose()).to.be(undefined);
        });

        it("should emit an 'detach'-Event before it disposes itself when it's a child displayable", function (done) {
            submitButton.on("detach", function onDetach() {
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

        it("should detach itself from parent node", function () {
            submitButton.dispose();
            expect(jQuery(form.root).find("[type='submit']").length).to.be.equal(0);
        });

        it("should NOT be possible to get a node", function () {
            submitButton.dispose();
            expect(submitButton.root).to.not.be.ok();
        });

        it("should NOT be possible to get a map of nodes", function () {
            submitButton.dispose();
            expect(submitButton.nodes).to.not.be.ok();
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
            jQuery(submitButton.root).click();
            done();
        });

        it("should NOT be possible to re-append a disposed Displayable", function () {
            submitButton.dispose();

            expect(function () {
                form.append(submitButton).at("form");
            }).to.be.throwError();
        });

        it("should be callable multiple times", function () {
            submitButton.dispose();
            submitButton.dispose();
        });

        it("should emit 'detach'-Event if .dispose() is called only on first call", function (done) {
            submitButton.on("detach", function beforeDispose() {
                done();
            });
            submitButton.dispose();

            submitButton.on("detach", function beforeDispose() {
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

            tmpDisplayable.append(form);

            form.dispose();

            expect(jQuery(tmpDisplayable.root).children()).to.have.length(0);
        });

        it("should empty all objects and arrays to avoid memory leaks", function () {
            var containers = [];

            _(form).each(function addContainers(val, key) {
                if (form.hasOwnProperty(key) === false ||
                    key === "constructor" ||
                    key === "_super" ||
                    value(val).typeOf(Node)) {
                    return;
                }
                if (value(val).typeOf(Array) || value(val).typeOf(Object)) {
                    containers.push(val);
                }
            });

            form.dispose();

            console.log(containers);
            _(containers).each(function checkContainers(container) {
                expect(container).to.be.empty();
            });
        });

    });

    describe(".hide()", function () {

        it("node should have the attribute class with at least " + cssClassHide + " as value", function () {
            displayable.hide();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(true);
        });

    });

    describe(".show()", function () {

        it("node should NOT have the attribute class with " + cssClassHide + " as value", function () {
            displayable.show();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(false);
        });

    });

    describe(".toggle()", function () {

        it("node should hide if already shown", function () {
            displayable.show();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(false);
            displayable.toggle();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(true);
        });

        it("node should show if been hidden", function () {
            displayable.hide();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(true);
            displayable.toggle();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(false);
        });

        it("node should force show if called with (true)", function () {
            displayable.show();
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(false);
            displayable.toggle(true);
            expect(jQuery(displayable.root).hasClass(cssClassHide)).to.be(false);
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

            form.append(submitBtn).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(form.isChild()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitBtn.isChild()).to.be(true);
        });

        it("should be false after .detach()", function () {
            submitBtn.detach();
            expect(submitBtn.isChild()).to.be(false);
        });

        it("should be false after .dispose()", function () {
            submitBtn.dispose();
            expect(submitBtn.isChild()).to.be(false);
        });
    });

    describe(".find()", function () {
        var displayable = new Displayable(
            "<div>" +
                "<p></p>" +
                "<em class='hello'></em>" +
                "<h1 id='article-headline'></h1>" +
            "</div>"
        );

        it("should perform a css query on the root node", function () {
            var match;

            match = displayable.find("div");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.root);
            match = displayable.find("p");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.root.childNodes[0]);
            match = displayable.find(".hello");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.root.childNodes[1]);
            match = displayable.find("#article-headline");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.root.childNodes[2]);
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
                expect(self.nodes).to.be(null);
                expect(self._children).to.be(null);
            }

            function init(self) {
                initCalled = true;
                expect(self).to.be(this);
                expect(self.nodes).to.be.an(Object);
                expect(self._children).to.be.an(Array);
                expect(self.root).to.be.a(HTMLDivElement);
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
            displayable.append(childDisplayable).at("root");

            expect(beforeParentCalled).to.be(true);
            expect(parentCalled).to.be(true);
        });
    });
    */
});