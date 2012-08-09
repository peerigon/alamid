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

            it("should emit an 'beforeAdd'-Event", function (done) {
                viewCollection.on("beforeAdd", function () {
                    done();
                });
                carCollection.push([porsche]);
            });

            it("should pass on 'beforeAdd'-Event as first argument an array containing all added Views", function (done) {
                var model,
                    newCars = [porsche, fiat];

                viewCollection.on("beforeAdd", function (views) {
                    _(views).each(function isView(view, index) {
                        model = jQuery(view.getNode()).find("[data-node='model']").text();
                        expect(model).to.be.equal(newCars[index].get("model"));
                    });
                    done();
                });
                carCollection.push(newCars);
            });


            it("should pass on 'beforeAdd'-Event as first argument an array containing all added Views in order", function (done) {
                var model,
                    newCars = [porsche, fiat],
                    newCarsLength = newCars.length;

                viewCollection.on("beforeAdd", function (views) {
                    _(views).each(function isView(view) {
                        model = jQuery(view.getNode()).find("[data-node='model']").text();
                        expect(model).to.be.equal(newCars[--newCarsLength].get("model"));
                    });
                    done();
                });
                carCollection.unshift(newCars);
            });

            it("should emit an 'add'-Event", function (done) {
                viewCollection.on("add", function () {
                   done();
                });
                carCollection.push([porsche]);
            });

            it("should pass on 'add'-Event as first argument an array containing all added Views", function (done) {
                var model,
                    newCars = [porsche, fiat];

                viewCollection.on("add", function (views) {
                    _(views).each(function isView(view, index) {
                        model = jQuery(view.getNode()).find("[data-node='model']").text();
                        expect(model).to.be.equal(newCars[index].get("model"));
                    });
                    done();
                });
                carCollection.push(newCars);
            });

            it("should pass on 'add'-Event as first argument an array containing all added Views in order", function (done) {
                var model,
                    newCars = [porsche, fiat],
                    newCarsLength = newCars.length;

                viewCollection.on("add", function (views) {
                    _(views).each(function isView(view) {
                        model = jQuery(view.getNode()).find("[data-node='model']").text();
                        expect(model).to.be.equal(newCars[--newCarsLength].get("model"));
                    });
                    done();
                });
                carCollection.unshift(newCars);
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

            it("should emit an 'beforeRemove'-Event", function (done) {
                viewCollection.on("beforeRemove", function beforeRemove() {
                   done();
                });
                carCollection.pop();
            });

            it("should pass on 'beforeRemove'-Event all Views which will be removed as an array", function (done) {
                var model;

                viewCollection.on("beforeRemove", function beforeRemove(views) {

                    _(views).each(function (view)  {
                        model = jQuery(view.getNode()).find("[data-node='model']").text();
                        expect(model).to.be.equal(cars[0].get("model"));
                    });

                    done();
                });

                carCollection.shift();
            });

            it("should emit an 'remove'-Event", function (done) {
                viewCollection.on("remove", function remove() {
                    done();
                });
                carCollection.pop();
            });

        });

        describe("._onSort", function () {

            it("should render all Views according to the sorting of the ModelCollection", function () {
                var liNodes;

                carCollection.sortBy("yoc", true);

                liNodes = $viewCollectioNode.find("li");

                //BMW: 2011
                expect(jQuery(liNodes[0]).find("[data-node='model']").text()).to.be.equal(cars[1].get("model"));
                //A6: 2010
                expect(jQuery(liNodes[1]).find("[data-node='model']").text()).to.be.equal(cars[0].get("model"));
                //Daimler 2008
                expect(jQuery(liNodes[2]).find("[data-node='model']").text()).to.be.equal(cars[2].get("model"));

                carCollection.sortBy("manufactor");

                liNodes = $viewCollectioNode.find("li");

                //A6: 2010
                expect(jQuery(liNodes[0]).find("[data-node='manufactor']").text()).to.be.equal(cars[0].get("manufactor"));
                //BMW: 2011
                expect(jQuery(liNodes[1]).find("[data-node='manufactor']").text()).to.be.equal(cars[1].get("manufactor"));
                //Daimler 2008
                expect(jQuery(liNodes[2]).find("[data-node='manufactor']").text()).to.be.equal(cars[2].get("manufactor"));
            });


            it("should emit an 'beforeSort'-Event", function (done) {
                viewCollection.on("beforeSort", function onBeforeSort() {
                    done();
                });
                carCollection.sortBy("model", true);
            });

            it("should emit an 'sort'-Event", function (done) {
                viewCollection.on("sort", function onSort() {
                    done();
                });
                carCollection.sortBy("manufactor");
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