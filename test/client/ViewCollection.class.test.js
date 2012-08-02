"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    ViewCollection = require("../../lib/client/ViewCollection.class.js"),
    ViewCollectionExampleWithTemplate = require("./mocks/ViewCollectionExampleWithTemplate.class.js"),
    CarLiElementView = require("./mocks/CarLiElementView.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    CarModel = require("./mocks/models/CarModel.class.js");

describe("ViewCollection", function () {

    var viewCollectioNode,
        $viewCollectioNode,
        viewCollection,
        audi,
        bmw,
        daimler,
        porsche,
        cars,
        carCollection;

    beforeEach(function () {

        viewCollection = new ViewCollectionExampleWithTemplate(CarLiElementView);
        viewCollectioNode = viewCollection.getNode();
        $viewCollectioNode = jQuery(viewCollectioNode);
        audi = new CarModel();
        audi.set({
            "manufactor": "Audi",
            "model": "A6",
            "yoc": new Date(2010)
        });
        bmw = new CarModel();
        bmw.set({
            "manufactor": "BMW",
            "model": "3",
            "yoc": new Date(2011)
        });
        daimler = new CarModel();
        daimler.set({
            "manufactor": "Daimler",
            "model": "E",
            "yoc": new Date(2008)
        });
        porsche = new CarModel();
        porsche.set({
            "manufactor": "Porsche",
            "model": "911",
            "yoc": new Date(1986)
        });
        cars = [audi, bmw, daimler];
        carCollection = new ModelCollection(CarModel, cars);
    });

    describe(".construct()", function () {

        it("should be an DisplayObject", function () {
           expect(is(viewCollection).instanceOf(DisplayObject)).to.be.ok();
        });

        it("should be possible to set a template", function (done) {
            viewCollection = new ViewCollection(CarLiElementView, DOMNodeMocks.getOlString());
            done();
        });

        it("should be possible to override a declared template", function () {
            viewCollection = new ViewCollectionExampleWithTemplate(CarLiElementView, DOMNodeMocks.getOlString());

            expect(viewCollection.getNode().toString()).to.be.equal(DOMNodeMocks.getOl().toString());
        });

        it("should throw an Error if a template was passed that does not include a node with 'data-node=\"views\"'", function () {
            expect(function () {
                viewCollection = new ViewCollection(CarLiElementView, "<ul></ul>");
            }).to.throwError();
        });

    });

    describe(".bind()", function () {

        beforeEach(function () {
            viewCollection.bind(carCollection);
        });

        it("should throw an Error if now instance of ModelCollection was given", function () {
            expect(function () {
                viewCollection.bind({});
            }).to.throwError();
        });

        it("should render for each Model in ModelCollection a View", function () {
            expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
        });

        it("should bind each Model in ModelCollection to a View", function () {
            var $liElements;

            carCollection.each(function changeManufactor(model) {
                model.set("manufactor", "Toyota");
            });

            $liElements = $viewCollectioNode.find("li");

            $liElements.each(function checkManufactor(index, liElement) {
                expect(jQuery(liElement).find("[data-node='manufactor']").text()).to.be.equal("Toyota");
            });
        });

        it("should create new Views for each Model which was added to ModelCollection", function () {
            carCollection.push(porsche);
            //expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
        });

        it("should return a reference to itself", function () {
           expect(viewCollection.bind(carCollection)).to.be.equal(viewCollection);
        });

    });




});

