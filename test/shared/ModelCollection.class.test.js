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

        it("should proxy 'change'-Event for each Model given on construction", function (done) {
            var changeEventCount = 0;

            modelCollection = new ModelCollection(OctocatModel, octocatModels);

            modelCollection.on("change", function onChange() {
                changeEventCount++;
            });

            _(octocatModels).each(function setName(model) {
                model.set("name", "Cpt. Spook");
            });

            expect(changeEventCount).to.be(octocatModels.length);
            done();
        });

    });

    describe(".set()", function () {

        it("should proxy 'change'-Event of set Model", function (done) {
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.set(5, octocatModel);
            octocatModel.set("name", "sbat");
        });

        it("should pass changed Model on 'change' as first argument", function (done) {
            modelCollection.on("change", function onChange(model) {
                expect(model).to.be(octocatModel);
                done();
            });
            modelCollection.set(5, octocatModel);
            octocatModel.set("name", "topa");
        });

        it("should remove 'change'-listener from overwritten Model", function (done) {
            modelCollection.on("change", function onChange() {
                done(); //Should not be called
            });
            modelCollection.set(3, octocatModel);
            modelCollection.set(3, octocatModels[2]);

            octocatModel.set("name", "topa");
            done();
        });

        it("should proxy 'change'-Event of overwriting Model", function (done) {
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.set(3, octocatModel);
            modelCollection.set(3, octocatModels[0]);

            octocatModels[0].set("name", "topa");
        });

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

        it("should proxy 'change'-Event for each pushed Model", function (done) {
            var changeEventCount = 0;

            modelCollection.on("change", function onChange() {
                changeEventCount++;
            });

            modelCollection.push(octocatModels);

            _(octocatModels).each(function setName(model) {
                model.set("name", "Cpt. Spook");
            });

            expect(changeEventCount).to.be(octocatModels.length);
            done();
        });

        it("should pass Model on 'change' as first argument", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.on("change", function onChange(model) {
                expect(model).to.be(octocatModels[1]);
                done();
            });
            octocatModels[1].set("name", "Master Batti");
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.push(octocatModels)).to.be(modelCollection);
        });

    });

    describe(".unshift()", function () {

        it("should proxy 'change'-Event' for each pushed Model", function (done) {
            var changeEventCount = 0;

            modelCollection.on("change", function onChange() {
                changeEventCount++;
            });

            modelCollection.unshift(octocatModels);

            _(octocatModels).each(function setName(model) {
                model.set("name", "Dr. siR");
            });

            expect(changeEventCount).to.be(octocatModels.length);
            done();
        });

        it("should pass Model on 'change' as first argument", function (done) {
            modelCollection.unshift(octocatModels);
            modelCollection.on("change", function onChange(model) {
                expect(model).to.be(octocatModels[1]);
                done();
            });
            octocatModels[1].set("name", "Chief Meaku");
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.unshift(octocatModels)).to.be(modelCollection);
        });

    });

    describe(".pop()", function () {

        it("should remove 'change' listener from popped Model", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.on("change", function (model) {
                done(); //Should not be called
            });
            modelCollection.pop();
            octocatModels.pop().set("name", "Dr. Hirsel");
            done();
        });

        it("should NOT remove 'change'-listeners which were set outside", function (done) {
            octocatModels[2].on("change", function onChange() {
                done();
            });
            modelCollection.push(octocatModels);
            modelCollection.pop();
            octocatModels[2].set("name", "Namcos");

        });

        it("should return the popped Model", function () {
            modelCollection.unshift(octocatModels);
            expect(modelCollection.pop()).to.be(octocatModels.pop());
        });

    });

    describe(".shift()", function () {

        it("should remove 'change' listener from popped Model", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.on("change", function (model) {
                done(); //Should not be called
            });
            modelCollection.shift();
            octocatModels.shift().set("name", "Dr. Hirsel");
            done();
        });

        it("should NOT remove 'change'-listeners which were set outside", function (done) {
            octocatModels[2].on("change", function onChange() {
                done();
            });
            modelCollection.push(octocatModels[2]);
            modelCollection.shift();
            octocatModels[2].set("name", "Namcos");
        });

        it("should return the popped Model", function () {
            modelCollection.unshift(octocatModels);
            expect(modelCollection.pop()).to.be(octocatModels.pop());
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

        it("should (natual-)sort collection 'birthday desceding if true is given as second argument", function () {

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

        it("should stop to proxy Model events", function () {
            var changeCallCount = 0;
            modelCollection.on("change", function onChange() {
                changeCallCount++;
            });
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            _(octocatModels).each(function triggerChange(model, index) {
                model.set("name", "" + index + "");
            });
            expect(changeCallCount).to.be(0);
        });

        it("should remove all models from collection", function () {
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            expect(modelCollection.toArray()).to.equal(null);
        });

        // memory leak test
        it("should remove all event listeners from models", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            modelCollection.on("change", function onRemove() {
                throw new Error("change-listener shall be removed, but it wasn't!");
            });
            modelCollection.on("remove", function onRemove() {
                throw new Error("remove-listener shall be removed, but it wasn't!");
            });
            octocatModels[0].emit("change");
            octocatModels[1].emit("destroy");
            done();
        });

    });

    describe("on Model.destroy()", function () {

        beforeEach(function () {
             modelCollection.push(octocatModels);
        });

        it("should emit 'remove'-Event if a Model was destroy and pass the Model", function (done) {

            modelCollection.once("remove", function checkPassedParam(models) {
                expect(octocatModel).to.equal(models[0]);
            });

            octocatModel.emit("destroy");    // faking delete, we just emit the event.

            modelCollection.once("remove", function checkPassedParam(models) {
                expect(octocatModels[1]).to.equal(models[0]);
                done();
            });

            octocatModels[1].emit("destroy");    // faking delete, we just emit the event.

        });

        it("it should remove the Model from Collection if it was destroy", function () {

            octocatModels[0].emit("destroy");    // faking delete, we just emit the event.
            expect(modelCollection.toArray()).to.eql([octocatModels[1], octocatModels[2]]);
            octocatModels[1].emit("destroy");
            expect(modelCollection.toArray()).to.eql([octocatModels[2]]);
            octocatModels[2].emit("destroy");
            expect(modelCollection.toArray()).to.eql([]);

        });

    });
});