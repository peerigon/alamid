"use strict";

var expect = require("expect.js"),
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    OctocatModel = require("./Model/Octocat.client.class.js"),
    environment = require("../../lib/shared/env.js");

describe("ModelCollection", function () {
    var modelCollection,
        octocatModel,
        octocatModels;

    beforeEach(function () {
        modelCollection = new ModelCollection(OctocatModel);
        octocatModel = new OctocatModel(1);
        octocatModels = [octocatModel, new OctocatModel(2), new OctocatModel(3)];
    });

    describe(".constructor()", function () {

        it("should be instance of Collection", function () {
            expect(modelCollection).to.be.an(Collection);
        });

    });

    describe(".set()", function () {

        it("return a reference to itself", function () {
           expect(modelCollection.set(0, octocatModel)).to.be(modelCollection);
        });

    });

    describe(".remove()", function () {

        beforeEach(function () {
            modelCollection.push(octocatModels);
        });

        it ("should be possible to remove an Model by passing it's reference", function (done) {

            var indexToRemove = 2;

            modelCollection.on("remove", function onRemove(elements, index, isMutated) {
                expect(elements[0]).to.equal(octocatModels[indexToRemove]);
                expect(index).to.equal(indexToRemove);
                expect(isMutated).to.equal(true);
                done();
            });

            modelCollection.remove(octocatModels[indexToRemove]);
        });

    });

    describe(".push()", function() {

        it("should return a reference to itself", function () {
            expect(modelCollection.push(octocatModels)).to.be(modelCollection);
        });

    });

    describe(".unshift()", function () {

        it("should return a reference to itself", function () {
            expect(modelCollection.unshift(octocatModels)).to.be(modelCollection);
        });

    });

    describe(".pop()", function () {

        it("should return the popped Model", function () {
            modelCollection.unshift(octocatModels);
            expect(modelCollection.pop()).to.be(octocatModels.pop());
        });

    });

    describe(".shift()", function () {

        it("should return the popped Model", function () {
            modelCollection.unshift(octocatModels);
            expect(modelCollection.pop()).to.be(octocatModels.pop());
        });

    });

    describe(".findById()", function () {

        it("should return undefined if no models have been given", function () {
            expect(modelCollection.findById(1)).to.be(undefined);
        });

        it("should return the model with the given id", function () {
            modelCollection.push(octocatModels);
            expect(modelCollection.findById(1)).to.be(octocatModels[0]);
            expect(modelCollection.findById(3)).to.be(octocatModels[2]);
        });

        it("should return undefined if no id has been found", function () {
            modelCollection.push(octocatModels);
            expect(modelCollection.findById(3894567954)).to.be(undefined);
        });

    });

    describe(".removeById()", function () {

        beforeEach(function () {
            modelCollection.push(octocatModels);
        });

        it("should remove the model with the given id", function () {
            modelCollection.removeById(2);
            modelCollection.removeById(3);
            expect(modelCollection.toArray()).to.eql([octocatModel]);
        });

        it("should return the removed model", function () {
            expect(modelCollection.removeById(1)).to.be(octocatModel);
        });

        it("should return undefined if there is no model with the given id", function () {
            expect(modelCollection.removeById(125126)).to.be(undefined);
        });

        it("should call .remove() with the right index", function (done) {
            modelCollection.remove = function (index) {
                expect(index).to.be(1);
                done();
            };
            modelCollection.removeById(2);
        });

        it("should call NOT call .remove() if there is no model with the given id", function () {
            modelCollection.remove = function () {
                throw new Error(".remove() should not be called");
            };
            modelCollection.removeById(26894);
        });

    });

    describe(".sortBy()", function () {

        var octocatModelsSortedByName,
            octocatModelsSortedByDate;

        beforeEach(function () {

            octocatModels[0].set("name", "a 3");
            octocatModels[0].set("birthday", new Date(1987, 9, 7));
            octocatModels[1].set("name", "a 1");
            octocatModels[1].set("birthday", new Date(1986, 4, 3));
            octocatModels[2].set("name", "b 9999 c");
            octocatModels[2].set("birthday", new Date(1986, 0, 27));

            octocatModelsSortedByName = [octocatModels[1], octocatModels[0], octocatModels[2]];
            octocatModelsSortedByDate = [octocatModels[2], octocatModels[1], octocatModels[0]];
        });

        it("should return a reference to itself", function () {
            modelCollection.push(octocatModelsSortedByName);
           expect(modelCollection.sortBy("name")).to.be(modelCollection);
        });

        it("should (natural-)sort collection by 'name'", function () {

            modelCollection.push(octocatModels);

            modelCollection.sortBy("name");

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be(octocatModelsSortedByName[index]);
            });

        });

        it("should (natural-)sort collection by 'birthday'", function () {

            modelCollection.push(octocatModels);

            modelCollection.sortBy("birthday");

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be(octocatModelsSortedByDate[index]);
            });

        });

        it("should (natual-)sort collection 'birthday descending if true is given as second argument", function () {

            var octocatModelsSortedByDateReverse = octocatModelsSortedByDate.reverse();

            modelCollection.push(octocatModelsSortedByDate);

            modelCollection.sortBy("birthday", true);

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be(octocatModelsSortedByDateReverse[index]);
            });

        });

        it("should emit an 'sort'-Event", function (done) {

            modelCollection.push(octocatModels);

            modelCollection.on("sort", function onChange() {
                done();
            });

            modelCollection.sortBy("name");
        });

    });

    describe(".dispose()", function () {

        it("should remove all models from collection", function () {
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            expect(modelCollection.toArray()).to.equal(null);
        });

        // memory leak test
        it("should remove all event listeners from models", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            modelCollection.on("remove", function onRemove() {
                throw new Error("remove-listener shall be removed, but it wasn't!");
            });
            octocatModels[1].emit("destroy");
            done();
        });

    });

    describe("on Model.destroy()", function () {

        function emitDestroy(model) {
            // faking delete, we just emit the event.
            model.emit("destroy", {
                target: model
            });
        }

        beforeEach(function () {
             modelCollection.push(octocatModels);
        });

        it("should emit 'remove'-Event if a Model was destroy and pass the Model", function (done) {

            modelCollection.once("remove", function checkPassedParam(models) {
                expect(octocatModel).to.equal(models[0]);
            });

            emitDestroy(octocatModel);

            modelCollection.once("remove", function checkPassedParam(models) {
                expect(octocatModels[1]).to.equal(models[0]);
                done();
            });

            emitDestroy(octocatModels[1]);

        });

        it("it should remove the Model from Collection if it was destroy", function () {

            emitDestroy(octocatModels[0]);
            expect(modelCollection.toArray()).to.eql([octocatModels[1], octocatModels[2]]);
            emitDestroy(octocatModels[1]);
            expect(modelCollection.toArray()).to.eql([octocatModels[2]]);
            emitDestroy(octocatModels[2]);
            expect(modelCollection.toArray()).to.eql([]);

        });

    });
});