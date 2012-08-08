"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    View = require("../../lib/client/View.class.js"),
    ViewCollection = require("../../lib/client/ViewCollection.class.js"),
    ViewCollectionExampleWithTemplate = require("./mocks/ViewCollectionExampleWithTemplate.class.js"),
    CarLiElementView = require("./mocks/CarLiElementView.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    CarModel = require("./mocks/models/CarModel.class.js"),
    _ = require("underscore");

describe("ViewCollection", function () {

    var viewCollectioNode,
        $viewCollectioNode,
        viewCollection,
        audi,
        bmw,
        daimler,
        porsche,
        fiat,
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
            "model": "3 series",
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
        fiat = new CarModel();
        fiat.set({
            "manufactor": "Fiat",
            "model": "126 P - Maluch",
            "yoc": new Date(1970)
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

        it("should render a View for each Model in ModelCollection", function () {
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

        describe("._onAdd()", function () {

            it("should create new Views for each Model which was added to ModelCollection with .push()", function () {
                carCollection.push(porsche);
                expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
            });

            it("should bind each Model which was added to ModelCollection with .push() to a new View", function () {
                var $liElements;

                carCollection.push([porsche, fiat]);

                $liElements = $viewCollectioNode.find("[data-node='model']");

                expect(jQuery($liElements[$liElements.length - 1]).text()).to.be.equal(fiat.get("model"));
            });

            it("should create new Views for each Model which was added to ModelCollection with .unshift()", function () {
                carCollection.unshift(fiat);
                expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
            });

            it("should bind each Model which was added to ModelCollection with .unshift() to a new View", function () {
                var $liElements;

                carCollection.unshift([fiat, porsche]);

                $liElements = $viewCollectioNode.find("[data-node='model']");

                expect(jQuery($liElements[0]).text()).to.be.equal(fiat.get("model"));
                expect(jQuery($liElements[1]).text()).to.be.equal(porsche.get("model"));
            });

            it("should create a new View for the Model which was added to ModelCollection with.set() on a new index", function () {
                carCollection.set(carCollection.size(), fiat);
                expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
            });

            it("should NOT create a new View for the Model which was added to ModelCollection with .set() on an old index", function () {
                carCollection.set(0, porsche);
                carCollection.set(0, fiat);
                expect($viewCollectioNode.find("li").length).to.be.equal(carCollection.size());
            });

            it("should bind the Model which was added to ModelCollection with .set() on an old index to an existing view", function () {
                carCollection.set(0, porsche);
                carCollection.set(0, fiat);
                fiat.set("model", "p126");
                expect(jQuery($viewCollectioNode.find("li [data-node='model']")[0]).text()).to.be.equal("p126");
            });

        });

        describe("._onRemove()", function () {

            it("should remove last View if .pop() was called on ModelCollection", function () {
                var $liElements,
                    $lastLiElement,
                    $lastLiElementModel,
                    lastModel;

                carCollection.push([porsche, fiat]);
                carCollection.pop();
                lastModel = carCollection.get(carCollection.size() - 1);

                $liElements =$viewCollectioNode.find("li");
                $lastLiElement = jQuery($liElements[$liElements.length - 1]);
                $lastLiElementModel = $lastLiElement.find("[data-node='model']");

                expect($lastLiElementModel.text()).to.be.equal(lastModel.get("model"));
            });

            it("should remove first View if .shift() was called on ModelCollection", function () {
                var $firstLiElement,
                    $firstLiElementModel,
                    firstModel;

                carCollection.unshift([porsche, fiat]);

                carCollection.shift();
                firstModel = carCollection.get(0);

                $firstLiElement = jQuery($viewCollectioNode.find("li")[0]);
                $firstLiElementModel = $firstLiElement.find("[data-node='model']");

                expect($firstLiElementModel.text()).to.be.equal(firstModel.get("model"));
            });

        });

        it("should return a reference to itself", function () {
           expect(viewCollection.bind(carCollection)).to.be.equal(viewCollection);
        });

    });

    describe(".each()", function () {

        beforeEach(function () {
            viewCollection.bind(carCollection);
        });

        it("should be possible to iterate over each rendered view", function () {
            var iterationCount = 0,
                expectedIterationCount = $viewCollectioNode.find("li").length;

            viewCollection.each(function viewsIterator() {
                iterationCount++;
            });

            expect(iterationCount).to.be.equal(expectedIterationCount);
        });

        it("should pass a View as first argument to given iterator function", function () {
            viewCollection.each(function viewsIterator(view) {
                expect(is(view).instanceOf(View)).to.be.equal(true);
            });
        });

    });

    describe(".destroyViews()", function () {

        beforeEach(function () {
           viewCollection.bind(carCollection);
        });

        it("should remove all Nodes", function () {
            var leftViewsCount;

            viewCollection.destroyViews();

            leftViewsCount = $viewCollectioNode.find("li").length;

            expect(leftViewsCount).to.be.equal(0);
        });

        it("should return an Array containing all destoryed Views", function () {
            var viewsCount,
                destroyedViewsCount,
                destroyedViews;

            viewsCount = $viewCollectioNode.find("li").length;
            destroyedViews = viewCollection.destroyViews();
            destroyedViewsCount = destroyedViews.length;

            expect(destroyedViewsCount).to.be.equal(viewsCount);
            _(destroyedViews).each(function viewCheck(view) {
                expect(is(view).instanceOf(View)).to.be.equal(true);
            });
        });

        it("should emit an 'destroy'-Event", function (done) {
            viewCollection.on("destroyViews", function () {
                done();
            });

            viewCollection.destroyViews();
        });

    });

    describe(".disposeViews()", function () {

        beforeEach(function () {
           viewCollection.bind(carCollection);
        });

        it("should remove all Nodes", function () {
            var leftViewsCount;

            viewCollection.disposeViews();

            leftViewsCount = $viewCollectioNode.find("li").length;

            expect(leftViewsCount).to.be.equal(0);
        });

        it("should remove all Views", function () {
            viewCollection.disposeViews();
            expect(viewCollection.destroyViews().length).to.be.equal(0);
        });

        it("should emit an 'dispose'-Event", function (done) {
            viewCollection.on("disposeViews", function () {
                done();
            });

            viewCollection.disposeViews();
        });

        it("should be still possible to bind a new ModelCollection", function () {
            var newCarCollection = new ModelCollection(CarModel, cars);

            viewCollection.disposeViews();
            viewCollection.bind(newCarCollection);

            expect($viewCollectioNode.find("li").length).to.be.equal(newCarCollection.size());
        });

        it("should return a reference to itself", function () {
            expect(viewCollection.disposeViews()).to.be.equal(viewCollection);
        });

    });

    describe(".render()", function () {

        it("should throw an Error if no ModelCollection was bound", function () {
           expect(function () {
               viewCollection = new ViewCollection(ViewCollectionExampleWithTemplate);
               viewCollection.render();
           }).to.throwError();
        });

        it("should re-render all Views", function () {
            var preRenderViewCount,
                postRenderViewCount;

            viewCollection.bind(carCollection);

            preRenderViewCount = $viewCollectioNode.find("li").length;

            viewCollection.render();

            postRenderViewCount = $viewCollectioNode.find("li").length;

            expect(preRenderViewCount).to.be.equal(postRenderViewCount);
        });

        it("should return a reference to itself", function () {
            viewCollection.bind(carCollection);
            expect(viewCollection.render()).to.be.equal(viewCollection);
        });

    });

    describe(".destroy()", function () {

        it("should return a reference to itself", function () {
            expect(viewCollection.destroy()).to.be.equal(viewCollection);
        });

        //@TODO
        /*
        it("should remove ViewCollection from the node where it was appended", function () {

        });
        */
    });

    describe(".dispose()", function () {

        //@TODO
        /*
         it("should remove ViewCollection from the node where it was appended", function () {

         });
         */

        it("should be callable multiple times", function (done) {
            viewCollection.dispose();
            viewCollection.dispose();
            done();
        });

    });

});