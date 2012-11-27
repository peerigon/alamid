"use strict";

var expect = require("expect.js");

var value = require("value"),

    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    View = require("../../lib/client/View.class.js"),

    ViewDefineExample = require("./mocks/ViewDefineExample.class.js"),

    formSchema = require("./mocks/models/schemas/formSchema.js"),
    FormModel = require("./mocks/models/FormModel.class.js"),

    FormView = require("./mocks/FormView.class.js");


describe("View", function () {

    var formView,
        template,
        formModel,
        schema;

    beforeEach(function () {

        formView = new FormView();
        template = formView.getTemplate();
        formModel = new FormModel();
        schema = formSchema;

    });

    describe(".construct()", function () {

        it("should be kind of DisplayObject", function () {
            expect(value(formView).instanceOf(DisplayObject));
        });

    });

    describe(".define()", function () {

        it("should return an instance of View", function () {
            expect(value(new ViewDefineExample()).instanceOf(View)).to.equal(true);
        });

        it("should provide .executeDone() which was defined in descriptor", function (done) {

            var definedView = new ViewDefineExample(done);

            definedView.executeDone();
        });

    });

    describe(".render()", function () {

        var $formView;

        beforeEach(function () {

            $formView = jQuery(formView.getNode());

        });

        it("should throw an error if no Model was bound or an data object as argument provided", function () {

            expect(function () {
                formView.render();
            }).to.throwError();

        });


        it("should return a reference to itself", function () {

            expect(formView.render({

                "range": 5

            })).to.be.equal(formView);

        });

        it("should apply data as value to a text-input-field", function () {

            var $text = $formView.find("[data-node='text']");

            formView.render( { "text": formSchema.text.default } );

            expect($text[0].value).to.equal(formSchema.text.default);

        });

        it("should apply data as value to a textarea", function () {

            var $textarea = $formView.find("[data-node='textarea']");

            formView.render( { "textarea": formSchema.textarea.default } );

            expect($textarea[0].value).to.equal(formSchema.textarea.default);

        });

        it("should apply data as value to a range-input-field", function () {

            var $range = $formView.find("[data-node='range']");

            formView.render( { "range": formSchema.range.default } );

            expect($range[0].value).to.eql(formSchema.range.default);

        });

        it("should apply Boolean to checked attribute to a checkbox-input-field", function () {

            var $checkbox = $formView.find("[data-node='checkbox']");

            formView.render( { "checkbox": formSchema.checkbox.default } );

            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
        });

        it("should apply Boolean to checked attribute to a checkbox-input-field", function () {

            var $radio = $formView.find("[data-node='radio']");

            formView.render( { "radio": formSchema.radio.default } );

            expect($radio[0].checked).to.equal(formSchema.radio.default);
        });

        it("should apply String as value to a button-input-field", function () {

            var $button = $formView.find("[data-node='button']");

            formView.render( { "button": formSchema.button.default } );

            expect($button[0].value).to.eql(formSchema.button.default);

        });

        it("should apply String as value to a submit-input-field", function () {

            var $submit = $formView.find("[data-node='submit']");

            formView.render( { "submit": formSchema.submit.default } );

            expect($submit[0].value).to.eql(formSchema.submit.default);

        });

        /*
        it("should apply a Date as value to date-input-field", function () {

            var $date = $formView.find("[data-node='date']");

            formView.render( { "date": formSchema.date.default } );

            expect($date[0].value).to.equal(formSchema.date.default.toString());

        });
        */

        /*
        it("should apply a Date as value to time-input-field", function () {

            var $time = $formView.find("[data-node='time']");

            formView.render( { "time": formSchema.time.default } );

            expect($time[0].value).to.equal(formSchema.time.default.toString());

        });
        */

        /*
        it("should apply a Date as value to a datetime-input-field", function () {

            var $datetime = $formView.find("[data-node='datetime']");

            formView.render( { "datetime": formSchema.datetime.default } );

            expect($datetime[0].value).to.equal(formSchema.time.default.toString());

        });
        */

        it("should apply Data as src-attribute to an image", function () {

            var $img = $formView.find("[data-node='img']");

            formView.render( { "img": formSchema.img.default } );

            expect($img[0].attributes.src).to.equal(formSchema.img.default);

        });

        it("should apply Data as innerText of any other Tag", function () {

            var $h1 = $formView.find("[data-node='heading']");

            formView.render( { "heading": "heading" } );

            expect($h1[0].innerText).to.equal("heading");

        });

        it("should emit an 'beforeRender'-Event", function (done) {

            formView.on("beforeRender", function onBeforeRender() {
                done();
            });

            formView.render( { } );
        });

        it("should emit an 'render'-Event", function (done) {

            formView.on("render", function onRender() {
                done();
            });
            formView.render( { } );
        });


    });

    describe(".bind()", function () {

        var $formView;

        beforeEach(function () {

            $formView = jQuery(formView.getNode());

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
                $checkbox = $formView.find("[data-node='checkbox']"),
                $img = $formView.find("[data-node='img']");

            formView.bind(formModel);

            expect($text.val()).to.equal(formSchema.text.default);
            expect($textarea.val()).to.equal(formSchema.textarea.default);
            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
            expect($img[0].attributes.src).to.equal(formSchema.img.default);

        });

        it("should be re-rendered after a new model was bound", function () {

            var newFormModel = new FormModel(),

                $text = $formView.find("[data-node='text']"),
                $textarea = $formView.find("[data-node='textarea']"),
                $checkbox = $formView.find("[data-node='checkbox']"),
                $img = $formView.find("[data-node='img']");

            newFormModel.set("text", "newText");

            formView.bind(formModel);
            formView.bind(newFormModel);

            expect($text.val()).to.equal("newText");
            expect($textarea.val()).to.equal(formSchema.textarea.default);
            expect($checkbox[0].checked).to.equal(formSchema.checkbox.default);
            expect($img[0].attributes.src).to.equal(formSchema.img.default);

        });

        it("should be re-rendered after a bound model has emitted 'change'-Event", function () {

            var $text = $formView.find("[data-node='text']"),
                $textarea = $formView.find("[data-node='textarea']"),
                $range = $formView.find("[data-node='range']"),
                $checkbox = $formView.find("[data-node='checkbox']"),
                $radio = $formView.find("[data-node='radio']"),
                $button = $formView.find("[data-node='button']"),
                $submit = $formView.find("[data-node='submit']"),
                $img = $formView.find("[data-node='img']");

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
            expect($img[0].attributes.src).to.equal(formSchema.img.default);

        });

    });

    describe(".unbind()", function () {

        it("should throw an Error if a Model was unbound and no data was given to .render() as argument", function () {

            formView.bind(formModel);

            formView.unbind();

            expect(function () {

                formView.render();

            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(formView.unbind()).to.be.equal(formView);
        });

        it("should NOT be re-rendered after an unbound Model has emitted 'change'-Event", function () {

            var $formView = jQuery(formView.getNode()),
                $text = $formView.find("[data-node='text']");

            formView.bind(formModel);
            formView.unbind();

            formModel.set("text", "newText");

            expect($text.val()).to.equal(formSchema.text.default);
        });

    });

    describe(".getModel()", function () {

        it("should return the bound Model", function () {

            formView.bind(formModel);

            expect(formView.getModel()).to.equal(formModel);

        });

    });

    describe(".dispose()", function () {

        it("should unbind a bound Model", function () {

            var $formView = jQuery(formView.getNode()),
                $text = $formView.find("[data-node='text']");

            formView.bind(formModel);
            formView.unbind();

            formModel.set("text", "newText");

            expect($text.val()).to.equal(formSchema.text.default);

        });

        it("should call Super's dispose()", function (done) {

            formView.on("beforeDispose", function () {

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
            }
            formModel.setService(formModelService);
            formView.bind(formModel);

        });

        it ("should dispose View if bound Model was deleted", function (done) {

            formView.on("dispose", function () {
                done();
            });

            formModel.destroy(function onDestroy(err) {
                if (err) throw err;
            });

        });

        it("should not dispose View if bound Model was unbound and then destroyed", function (done) {

            formView.on("dispose", function () {
                // should not be called otherwise mocha will display an Error
                done();
            });

            formView.unbind();

            formModel.destroy(function onDestroyed(err) {

                if (err) throw err;

                done();

            });

        });

    });

});