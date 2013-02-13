"use strict";

var expect = require("expect.js"),
    value = require("value"),
    path = require("path"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    Plugins = require("../../lib/shared/Plugins.mixin.js"),
    DOMNodeMocks = require("./mocks/DOMNodeMocks.js"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),
    collectNodeReferences = require("../testHelpers/collectNodeReferences.js"),
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

            expect(myDisplayable.getRoot()).to.be.an(HTMLOListElement);
        });

        it("should apply the passed node in favor of the Displayable's template", function () {
            var ol = document.createElement("ol"),
                myDisplayable = new MyDisplayable(ol);

            expect(myDisplayable.getRoot()).to.be.an(HTMLOListElement);
        });

        it("should apply '<div data-node=\"root\"></div>' as default template if nothing has been passed", function () {
            var myDisplayable = new Displayable();

            expect(myDisplayable.getRoot().outerHTML).to.be('<div data-node="root"></div>');
        });
    });

    describe(".template", function () {
        it("should apply the Displayable's template if no template was passed", function () {
            expect(submitButton.getRoot()).to.be.an(HTMLInputElement);
        });

    });

    describe(".domEvents", function () {

        it("should attach all dom events to the nodes", function () {
            var inputAClick = "untriggered",
                inputBClick = "untriggered",
                MyDisplayable,
                myDisplayable;

            MyDisplayable = Displayable.extend({
                template: formTemplate,
                domEvents: {
                    "input-a": {
                        click: function () {
                            inputAClick = "triggered";
                        }
                    },
                    "input-b": {
                        click: function () {
                            inputBClick = "triggered";
                        }
                    }
                }
            });
            myDisplayable = new MyDisplayable();

            myDisplayable.getNodes()["input-a"].click();
            myDisplayable.getNodes()["input-b"].click();

            expect(inputAClick).to.be("triggered");
            expect(inputBClick).to.be("triggered");
        });

        it("should call the handlers bound to the displayable if defined as string", function(done) {
            var MyDisplayable,
                myDisplayable;

            MyDisplayable = Displayable.extend({
                template: formTemplate,
                domEvents: {
                    "input-a": {
                        click: "_onFocus"
                    }
                },
                _onFocus: function (event) {
                    expect(this).to.be(myDisplayable);
                    expect(event.target).to.be(this.getNodes()["input-a"]);
                    done();
                }
            });
            myDisplayable = new MyDisplayable();

            myDisplayable.getNodes()["input-a"].click();
        });

    });

    describe(".getRoot()", function () {

        it("should return the root node according to the given template", function () {
            expect(displayable.getRoot()).to.be.an(HTMLFormElement);
        });

    });
    
    describe(".getParent()", function () {
        
        it("should return null if the displayable is not a child", function () {
            expect(displayable.getParent()).to.be(null);
        });
        
        it("should return the parent displayable where this displayable has been added to", function () {
            form.append(displayable).at("form");
            expect(displayable.getParent()).to.be(form);
        });
        
    });
    

    describe(".getNodes()", function () {

        it("should return an object", function () {
            expect(displayable.getNodes()).to.be.an(Object);
        });

        it("should return a map of nodes including a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodes = displayable.getNodes();

            expect(nodes.form).to.be.an(HTMLFormElement);
            expect(nodes["input-a"]).to.be.an(HTMLInputElement);
            expect(nodes["input-c"]).to.be.an(HTMLInputElement);
            expect(nodes["input-c"]).to.be.an(HTMLInputElement);
        });

        it("should return an object with a reference on 'root' if no template was given", function () {
            displayable = new Displayable();
            expect(displayable.getNodes().root).to.be(displayable.getRoot());
        });

    });

    describe(".append().at()", function () {

        it("should throw an Error if an object not kind of Displayable is given", function () {
            expect(function () {
                form.append({}).at("form");
            }).to.throwError();
        });

        it("should throw an Error if a not existent node name was passed to at()", function () {
            expect(function () {
                form.append(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form.append(submitButton).at("form")).to.be(form);
        });

        it("should append submit-button to form", function () {
            form.append(submitButton).at("form");

            var $lastChild = jQuery(form.getRoot()).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be(submitButton.getRoot().toString());
            expect($lastChild.val()).to.be(submitButton.getRoot().value);
        });

        it("should emit a 'child'-event", function (done) {
            form.on("child", function (event) {
                expect(event.target).to.be(form);
                expect(event.child).to.be(submitButton);
                done();
            });

            form.append(submitButton).at("form");
        });

        it("should emit a 'document'-event if the parent displayable is in the document", function (done) {
            form.isInDocument = function () { return true; };

            submitButton.on("document", function onDom(event) {
                expect(event.name).to.be("DocumentEvent");
                expect(event.target).to.be(submitButton);
                done();
            });

            form.append(submitButton).at("form");
        });

        it("should emit no 'document'-event if the parent displayable is not in the dom", function () {
            submitButton.on("document", function onDom() {
                throw new Error("This function should not be called");
            });

            form.append(submitButton).at("form");
        });

    });

    describe(".prepend().at()", function () {

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form.prepend({}).at("form");
            }).to.throwError();
        });

        it("should throw an Error if a not existent node name was passed to # at()", function () {
            expect(function () {
                form.prepend(submitButton).at("not_existing_node");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(form.prepend(submitButton).at("form")).to.be(form);
        });

        it("should prepend submit-button to form", function () {
            form.prepend(submitButton).at("form");

            var $firstChild = jQuery(form.getRoot()).find(":first-child"),
                firstChild = $firstChild[0];

            expect(firstChild.toString()).to.be(submitButton.getRoot().toString());
            expect($firstChild.val()).to.be(submitButton.getRoot().value);
        });

        it("should emit a 'child'-event", function (done) {
            form.on("child", function (event) {
                expect(event.target).to.be(form);
                expect(event.child).to.be(submitButton);
                done();
            });

            form.prepend(submitButton).at("form");
        });

        it("should emit a 'document'-event if the parent displayable is in the dom", function (done) {
            form.isInDocument = function () { return true; };

            submitButton.on("document", function onDom(event) {
                expect(event.name).to.be("DocumentEvent");
                expect(event.target).to.be(submitButton);
                done();
            });

            form.prepend(submitButton).at("form");
        });

        it("should emit no 'document'-event if the parent displayable is not in the dom", function () {
            submitButton.on("document", function onDom() {
                throw new Error("This function should not be called");
            });

            form.prepend(submitButton).at("form");
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
            expect(form.find("[type='submit']")).to.have.length(0);
        });

        it("should remove the parent reference after detaching", function () {
            form.append(submitButton).at("form");
            expect(submitButton.getParent()).to.be(form);
            submitButton.detach();
            expect(submitButton.getParent()).to.be(null);
        });

        it("should still be possible to trigger attached events after .detach()", function (done) {
            var submitButtonNode = jQuery(submitButton.getNodes()["submit-button"]);

            submitButtonNode.on("click", function () {
                done();
            });

            form.append(submitButton).at("form");
            submitButton.detach();
            submitButtonNode.click();
        });

        it("should be possible to re-append a detached Displayable", function () {
            form.append(submitButton).at("form");
            submitButton.detach();
            form.append(submitButton).at("form");

            expect(
                jQuery(form.getRoot()).find("[type='submit']")[0].toString()
            ).to.be(submitButton.getRoot().toString());
        });

        it("should not leave any event listeners on a child", function () {
            var len,
                expectedListeners = [],
                actualListeners = [];

            _(submitButton._events).each(function (events) {
                len = value(events).typeOf(Array)? events.length: 1;
                expectedListeners.push(len);
            });
            form.append(submitButton).at("form");
            submitButton.detach();
            _(submitButton._events).each(function (events) {
                len = value(events).typeOf(Array)? events.length: 1;
                actualListeners.push(len);
            });
            expect(actualListeners).to.eql(expectedListeners);
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
            expect(jQuery(form.getRoot()).find("[type='submit']").length).to.be(0);
        });

        it("should NOT be possible to get a node", function () {
            submitButton.dispose();
            expect(submitButton.getRoot()).to.not.be.ok();
        });

        it("should NOT be possible to get a map of nodes", function () {
            submitButton.dispose();
            expect(submitButton.getNodes()).to.not.be.ok();
        });

        it("should remove all dom event listeners", function () {
            var submitButtonNode = jQuery(submitButton.getNodes()["submit-button"]);

            submitButtonNode.on("click", function () {
                throw new Error("This function should not be called");
            });

            form.append(submitButton).at("form");
            submitButton.dispose();
            submitButtonNode.click();
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

        it("should emit an 'detach'-event only on first call", function (done) {
            submitButton.on("detach", function beforeDispose() {
                done();
            });
            submitButton.dispose();

            submitButton.on("detach", function beforeDispose() {
                throw new Error("This function should not be called");
            });
            submitButton.dispose();
        });

        it("should emit an 'dispose'-event only on first call", function (done) {
            submitButton.on("dispose", function dispose() {
                done();
            });
            submitButton.dispose();

            submitButton.on("dispose", function dispose() {
                throw new Error("This function should not be called");
            });
            submitButton.dispose();
        });

        it("should dispose form and child Displayables", function () {
            var tmpDisplayable = new Displayable("<div data-node='child'></div>");

            tmpDisplayable.append(form);

            form.dispose();

            expect(jQuery(tmpDisplayable.getRoot()).children()).to.have.length(0);
        });

        it("should remove all node references", function () {
            var nodeRefs;

            form.dispose();
            nodeRefs = collectNodeReferences(form);
            expect(nodeRefs).to.be.empty();
        });

    });

    describe(".hide()", function () {

        it("should apply the css class '" + cssClassHide + "'", function () {
            displayable.hide();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(true);
        });

    });

    describe(".show()", function () {

        it("should remove the css class '" + cssClassHide + "'", function () {
            displayable.show();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(false);
        });

    });

    describe(".toggle()", function () {

        it("should hide if already shown", function () {
            displayable.show();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(false);
            displayable.toggle();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(true);
        });

        it("should show if been hidden", function () {
            displayable.hide();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(true);
            displayable.toggle();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(false);
        });

        it("should force show if called with true", function () {
            displayable.show();
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(false);
            displayable.toggle(true);
            expect(jQuery(displayable.getRoot()).hasClass(cssClassHide)).to.be(false);
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
    
    describe(".isInDocument()", function () {
        var mainPage;
        
        it("should be false by default", function () {
            expect(displayable.isInDocument()).to.be(false);
        });

        it("should be true if the root is the document", function () {
            mainPage = new Displayable(document);
            expect(mainPage.isInDocument()).to.be(true);
        });

        it("should be true if one of the parents is in the document", function () {
            mainPage = new Displayable();
            mainPage.isInDocument = function () { return true; };
            mainPage.append(displayable).at("root");
            expect(displayable.isInDocument()).to.be(true);
        });

        it("should be false after the displayable has been detached again", function () {
            mainPage = new Displayable();
            mainPage.isInDocument = function () { return true; };
            mainPage.append(displayable).at("root");
            displayable.detach();
            expect(displayable.isInDocument()).to.be(false);
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
            expect(match[0]).to.be(displayable.getRoot());
            match = displayable.find("p");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.getRoot().childNodes[0]);
            match = displayable.find(".hello");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.getRoot().childNodes[1]);
            match = displayable.find("#article-headline");
            expect(match).to.have.length(1);
            expect(match[0]).to.be(displayable.getRoot().childNodes[2]);
        });

    });

    describe(".emit()", function () {

        it("should emit the 'document'-event on all children", function () {
            var called = "";

            submitButton.on("document", function (event) {
                called += "submitButton ";
                expect(event.name).to.be("DocumentEvent");
                expect(event.target).to.be(submitButton);
            });

            displayable.on("document", function (event) {
                called += "displayable ";
                expect(event.name).to.be("DocumentEvent");
                expect(event.target).to.be(displayable);
            });

            form.append(submitButton).at("form");
            form.append(displayable).at("form");
            form.emit("document");
            expect(called).to.be("submitButton displayable ");
        });

    });



    /*
    describe(".Plugins", function () {
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

    describe(".Hooks", function () {
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
                expect(self.getNodes()).to.be(null);
                expect(self._children).to.be(null);
            }

            function init(self) {
                initCalled = true;
                expect(self).to.be(this);
                expect(self.getNodes()).to.be.an(Object);
                expect(self._children).to.be.an(Array);
                expect(self.getRoot()).to.be.a(HTMLDivElement);
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