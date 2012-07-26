"use strict";

var expect = require("expect.js");

var is = require("nodeclass").is,
    formSchemaABC = require("./mocks/formSchemaABC.js"),
    formSchemaDEF = require("./mocks/formSchemaDEF.js"),
    FormModelABC = require("./mocks/FormModelABC.class.js"),
    FormModelDEF = require("./mocks/FormModelDEF.class.js"),
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    View = require("../../lib/client/View.class.js"),
    ExtendedByView = require("./mocks/ExtendedByView.class.js");

describe("View", function () {

    var formTemplate = DOMNodeMocks.getFormString()
            .replace("value='a'", '') //Remove values as they should be rendered on bind()
            .replace("value='b'", '')
            .replace("value='c'", ''),
        view,
        formModelABC,
        formModelDEF;

    beforeEach(function () {
        formModelABC = new FormModelABC();
        formModelDEF = new FormModelDEF();
        view = new ExtendedByView(formTemplate);
    });

    describe(".construct()", function () {

        it("should be kind of DisplayObject", function () {
            expect(is(view).instanceOf(DisplayObject));
        });

    });

    describe(".render()", function () {

        it("should throw an error if no Model was bound or data as argument provided", function () {
            expect(function () {
                view.render();
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(view.render({
                "input-a": formSchemaABC["input-a"].default,
            })).to.be.equal(view);
        });

        it("should render the data which was given as argument", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']"),
                $inputB = $form.find("[data-node='input-b']"),
                $inputC = $form.find("[data-node='input-c']");

            view.render({
                "input-a": formSchemaABC["input-a"].default,
                "input-b": formSchemaABC["input-b"].default,
                "input-c": formSchemaABC["input-c"].default
            });

            expect($inputA.val()).to.be.equal(formSchemaABC["input-a"].default);
            expect($inputB.val()).to.be.equal(formSchemaABC["input-b"].default);
            expect($inputC.val()).to.be.equal(formSchemaABC["input-c"].default);
        });

    });

    describe(".bind()", function () {

        it("should throw an Error if you try to bind an Object not kind of Model", function () {
            expect(function () {
                view.bind({});
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
           expect(view.bind(formModelABC)).to.be.equal(view);
        });

        it("should render the view according to data from given model", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']"),
                $inputB = $form.find("[data-node='input-b']"),
                $inputC = $form.find("[data-node='input-c']");

            view.bind(formModelABC);

            expect($inputA.val()).to.be.equal(formSchemaABC["input-a"].default);
            expect($inputB.val()).to.be.equal(formSchemaABC["input-b"].default);
            expect($inputC.val()).to.be.equal(formSchemaABC["input-c"].default);
        });

        it("should be possible to bind another model", function (done) {
            view.bind(formModelDEF);
            done();
        });

        it("should be re-rendered after a new model was binded", function () {
            var $form = jQuery(view.getNode()),
                $inputD = $form.find("[data-node='input-a']"),
                $inputE = $form.find("[data-node='input-b']"),
                $inputF = $form.find("[data-node='input-c']");

            view.bind(formModelABC);
            view.bind(formModelDEF);

            expect($inputD.val()).to.be.equal(formSchemaDEF["input-a"].default);
            expect($inputE.val()).to.be.equal(formSchemaDEF["input-b"].default);
            expect($inputF.val()).to.be.equal(formSchemaDEF["input-c"].default);
        });

        it("should be re-rendered after a bound model has emitted 'change'-Event", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']");

            view.bind(formModelABC);

            formModelABC.set("input-a", "d"); //set will emit 'change'-Event

            expect($inputA.val()).to.be.equal("d");
        });

    });

    describe(".unbind()", function () {

        it("should throw an Error if a Model was unbound and no data was given to .render() as argument", function () {
            view.bind(formModelABC);
            view.unbind();
            expect(function () {
                view.render();
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            expect(view.unbind()).to.be.equal(view);
        });

        it("should NOT be re-rendered after an unbound Model has emitted 'change'-Event", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']");

            view.bind(formModelABC);
            view.unbind();

            formModelABC.set("input-a", "d");

            expect($inputA.val()).to.be.equal(formSchemaABC["input-a"].default);
        });

    });

    describe(".dispose()", function () {

        it("should unbind a bound Model", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']");

            view.bind(formModelABC);
            view.dispose();

            formModelABC.set("input-a", "d");

            expect($inputA.val()).to.be.equal(formSchemaABC["input-a"].default);
        });

        it("should call Super's dispose()", function (done) {
            view.on("beforedispose", function () {
                done();
            });

            view.dispose();
        });

    });

});