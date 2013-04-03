"use strict";

var expect = require("../testHelpers/expect.jquery.js"),
    value = require("value"),
    Displayable = require("../../lib/client/Displayable.class.js"),
    View = require("../../lib/client/View.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    formSchema = require("./mocks/models/schemas/formSchema.js"),
    FormView = require("./mocks/FormView.class.js"),
    jQuery = require("../../lib/client/helpers/jQuery.js");

describe("View", function () {

    var formView,
        formModel,
        schema;

    beforeEach(function () {

        formView = new FormView();
        formModel = new Model("fake id");
        formModel.setSchema(formSchema);
        schema = formSchema;

    });

    describe("#constructor()", function () {

        it("should be kind of Displayable", function () {
            expect(value(formView).typeOf(View));
        });

    });

    describe("#render()", function () {

        var $formView;

        beforeEach(function () {
            $formView = formView.getRoot();
        });

        it("should throw an error if no Model was bound or an data object as argument provided", function () {
            expect(function () {
                formView.render();
            }).to.throwError();
        });


        it("should return a reference to itself", function () {
            expect(formView.render({})).to.be(formView);
        });

        it("should apply data as value to a text-input-field", function () {
            var $text = $formView.find("[data-node='text']");

            formView.render( { "text": formSchema.text.default } );
            expect($text).to.have.prop("value", formSchema.text.default);
        });

        it("should apply data as value to a textarea", function () {
            var $textarea = $formView.find("[data-node='textarea']");

            formView.render( { "textarea": formSchema.textarea.default } );
            expect($textarea).to.have.prop("value", formSchema.textarea.default);
        });

        it("should apply data as value to a range-input-field", function () {
            var $range = $formView.find("[data-node='range']");

            formView.render( { "range": formSchema.range.default } );
            expect($range).to.have.prop("value", formSchema.range.default);
        });

        it("should apply Boolean to checked attribute to a checkbox-input-field", function () {
            var $checkbox = $formView.find("[data-node='checkbox']");

            formView.render( { "checkbox": formSchema.checkbox.default } );
            expect($checkbox).to.have.prop("checked", formSchema.checkbox.default);
        });

        it("should apply Boolean to checked attribute to a checkbox-input-field", function () {
            var $radio = $formView.find("[data-node='radio']");

            formView.render( { "radio": formSchema.radio.default } );
            expect($radio).to.have.prop("checked", formSchema.radio.default);
        });

        it("should apply String as value to a button-input-field", function () {
            var $button = $formView.find("[data-node='button']");

            formView.render( { "button": formSchema.button.default } );
            expect($button).to.have.prop("value", formSchema.button.default);
        });

        it("should apply String as value to a submit-input-field", function () {
            var $submit = $formView.find("[data-node='submit']");

            formView.render( { "submit": formSchema.submit.default } );
            expect($submit).to.have.prop("value", formSchema.submit.default);
        });

        it("should apply Data as src-attribute to an image", function () {
            var $img = $formView.find("[data-node='img']"),
                expectedSrc = formSchema.img.default,
                actualSrc;

            formView.render( { "img": formSchema.img.default } );
            // we have to check here differently because browsers append the current host to the src and try to fetch image
            actualSrc = $img.prop("src").substr(-expectedSrc.length);
            expect(actualSrc).to.be(expectedSrc);
        });

        it("should apply Data as text of any other Tag", function () {
            var $h1 = $formView.find("[data-node='headline']");

            formView.render( { "headline": "headline" } );
            expect($h1.text()).to.be("headline");
        });

        it("should not be possible to inject html tags", function () {
            formView.render({
                headline:
                    "<script>" +
                        "document.body.innerHTML = 'PWNED! If you can read this message the View is a potential security risk.';" +
                    "</script>" +
                    "<div id='inject-test'></div>"
            });

            // checking for the presence of escape char
            expect(formView.getNode("headline").html()).to.match(/^&lt;/);
            expect(formView.find("#inject-test")).to.be.empty();
        });

        it("should emit an 'beforeRender'-Event", function (done) {
            formView.on("beforeRender", done);
            formView.render( { } );
        });

        it("should emit an 'render'-Event", function (done) {
            formView.on("render", function onRender() {
                done();
            });
            formView.render( { } );
        });

    });

    describe("#bind()", function () {
        var $formView;

        beforeEach(function () {
            $formView = formView.getRoot();
        });

        it("should throw an Error if you try to bind an Object not kind of Model", function () {
            expect(function () {
                formView.bind({});
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formView.bind(formModel)).to.equal(formView);
        });

        it("should render the view according to data from given model", function () {
            var $text = $formView.find("[data-node='text']"),
                $textarea = $formView.find("[data-node='textarea']"),
                $checkbox = $formView.find("[data-node='checkbox']");

            formView.bind(formModel);

            expect($text.val()).to.equal(formSchema.text.default);
            expect($textarea.val()).to.equal(formSchema.textarea.default);
            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
        });

        it("should be re-rendered after a new model was bound", function () {
            var otherModel = new Model(),

                $text = $formView.find("[data-node='text']"),
                $textarea = $formView.find("[data-node='textarea']"),
                $checkbox = $formView.find("[data-node='checkbox']");

            otherModel.set("text", "newText");

            formView.bind(formModel);
            formView.bind(otherModel);

            expect($text.val()).to.equal("newText");
            expect($textarea.val()).to.equal(formSchema.textarea.default);
            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
        });

        it("should be re-rendered after a bound model has emitted 'change'-Event", function () {
            var $text = $formView.find("[data-node='text']"),
                $textarea = $formView.find("[data-node='textarea']"),
                $range = $formView.find("[data-node='range']"),
                $checkbox = $formView.find("[data-node='checkbox']"),
                $radio = $formView.find("[data-node='radio']"),
                $button = $formView.find("[data-node='button']"),
                $submit = $formView.find("[data-node='submit']");

            formView.bind(formModel);

            formModel.set({
                "text": "newText",
                "textarea": "newTextArea"
            });

            expect($text.val()).to.equal("newText");
            expect($textarea.val()).to.equal("newTextArea");
            expect(parseInt($range.val())).to.equal(formSchema.range.default);
            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
            expect($radio[0].checked).to.equal(formSchema.radio.default);
            expect($button.val()).to.equal(formSchema.button.default);
            expect($submit.val()).to.equal(formSchema.submit.default);
        });

        it("should not be possible to inject html tags", function () {
            var otherModel = new Model();

            otherModel.set("message",
                "<script>" +
                    "alert('PWNED! If you can read this message the View is a potential security risk.');" +
                    "console.log('PWNED! If you can read this message the View is a potential security risk.');" +
                "</script>" +
                "<div id='inject-test'></div>"
            );
            formView.bind(otherModel);

            // checking for the presence of escape char
            expect(formView.getNode("message").html()).to.match(/^&lt;/);
            expect(formView.find("#inject-test")).to.be.empty();
        });

    });

    describe("#unbind()", function () {
        it("should throw an Error if a Model was unbound and no data was given to .render() as argument", function () {
            formView.bind(formModel);
            formView.unbind();
            expect(function () {
                formView.render();
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formView.unbind()).to.be(formView);
        });

        it("should NOT be re-rendered after an unbound Model has emitted 'change'-Event", function () {
            var $formView = jQuery(formView.getRoot()),
                $text = $formView.find("[data-node='text']");

            formView.bind(formModel);
            formView.unbind();

            formModel.set("text", "newText");

            expect($text.val()).to.equal(formSchema.text.default);
        });

    });

    describe("#getModel()", function () {

        it("should return the bound Model", function () {
            formView.bind(formModel);
            expect(formView.getModel()).to.equal(formModel);
        });

    });

    describe("#dispose()", function () {

        it("should unbind a bound Model", function () {
            var $formView = jQuery(formView.getRoot()),
                $text = $formView.find("[data-node='text']");

            formView.bind(formModel);
            formView.unbind();

            formModel.set("text", "newText");

            expect($text.val()).to.equal(formSchema.text.default);
        });

        it("should call super's dispose()", function (done) {
            formView.on("dispose", function () {
                done();
            });
            formView.dispose();
        });

    });

    describe("on Model.destroy()", function () {
        var formModelService;

        beforeEach(function () {
            formModelService = {
                destroy: function (remote, ids, onDestroy) {
                    onDestroy({ status: "success" });
                }
            };
            formModel.setService(formModelService);
            formView.bind(formModel);
        });

        it ("should dispose View if bound Model was deleted", function (done) {
            formView.on("dispose", function () {
                done();
            });
            formModel.destroy(function onDestroy(err) {
                if (err) {
                    throw err;
                }
            });
        });

        it("should not dispose View if bound Model was unbound and then destroyed", function (done) {
            formView.on("dispose", function () {
                throw new Error("This function should not be called");
            });
            formView.unbind();
            formModel.destroy(function onDestroyed(err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });

    });

});