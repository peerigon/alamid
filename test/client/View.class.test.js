"use strict";

var expect = require("expect.js");

var is = require("nodeclass").is,
    formSchemaABC = require("./mocks/formSchemaABC.js"),
    formSchemaDEF = require("./mocks/formSchemaDEF.js"),
    FormModelABC = require("./mocks/FormModelABC.class.js"),
    FormModelDEF = require("./mocks/FormModelDEF.class.js"),
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    View = require("../../lib/client/View.class.js");

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
        view = new View(formTemplate);
    });

    describe(".construct()", function () {

        it("should be kind of DisplayObject", function () {
            expect(is(view).instanceOf(DisplayObject));
        });

    });

    describe(".bind()", function () {

        it("should throw an Error if you try to bind an Object not kind of Model", function () {
            expect(function () {
                view.bind({});
            }).to.throwError();
        });

        it("should render the view according to data from given model", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']"),
                $inputB = $form.find("[data-node='input-b']"),
                $inputC = $form.find("[data-node='input-c']");

            view.bind(formModelABC);

            expect($inputA.val()).to.be.equal(formSchemaABC.a.default);
            expect($inputB.val()).to.be.equal(formSchemaABC.b.default);
            expect($inputC.val()).to.be.equal(formSchemaABC.c.default);
        });

        it("should be possible to bind another model", function (done) {
            view.bind(formModelDEF);
            done();
        });

        it("should be re-rendered after a new model was binded", function () {
            var $form = jQuery(view.getNode()),
                $inputA = $form.find("[data-node='input-a']"),
                $inputB = $form.find("[data-node='input-b']"),
                $inputC = $form.find("[data-node='input-c']");

            view.bind(formModelABC);
            view.bind(formModelDEF);

            expect($inputA.val()).to.be.equal(formSchemaDEF.d.default);
            expect($inputB.val()).to.be.equal(formSchemaDEF.e.default);
            expect($inputC.val()).to.be.equal(formSchemaDEF.f.default);
        });

    });

});