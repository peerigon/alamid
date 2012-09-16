"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js"),
    Model = require("../../lib/shared/Model.class.js"),
    OctocatModel = require("./Model/Octocat.class.js");



describe("ModelCollection", function () {

    var modelCollection,
        octocatModel,
        octocatModels;

    beforeEach(function () {
        modelCollection = new ModelCollection(OctocatModel);
        octocatModel = new OctocatModel();
        octocatModels = [octocatModel, new OctocatModel(), new OctocatModel()];
    });

    describe(".construct()", function () {

        it("should be instance of Collection", function () {
            expect(is(modelCollection).instanceOf(Collection)).to.be.ok();
        });

        it("should throw an Error if Model-Class was given", function () {
            expect(function() {
                modelCollection = new ModelCollection();
            }).to.throwError();
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

            expect(changeEventCount).to.be.equal(octocatModels.length);
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
                expect(model).to.be.equal(octocatModel);
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
           expect(modelCollection.set(0, octocatModel)).to.be.equal(modelCollection);
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

            expect(changeEventCount).to.be.equal(octocatModels.length);
            done();
        });

        it("should pass Model on 'change' as first argument", function (done) {
            modelCollection.push(octocatModels);
            modelCollection.on("change", function onChange(model) {
                expect(model).to.be.equal(octocatModels[1]);
                done();
            });
            octocatModels[1].set("name", "Master Batti");
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.push(octocatModels)).to.be.equal(modelCollection);
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

            expect(changeEventCount).to.be.equal(octocatModels.length);
            done();
        });

        it("should pass Model on 'change' as first argument", function (done) {
            modelCollection.unshift(octocatModels);
            modelCollection.on("change", function onChange(model) {
                expect(model).to.be.equal(octocatModels[1]);
                done();
            });
            octocatModels[1].set("name", "Chief Meaku");
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.unshift(octocatModels)).to.be.equal(modelCollection);
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
            expect(modelCollection.pop()).to.be.equal(octocatModels.pop());
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
            expect(modelCollection.pop()).to.be.equal(octocatModels.pop());
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

        it("should throw an Error if a none existing attribute was given", function () {
            modelCollection.push(octocatModels);
            expect(function () {
                modelCollection.sortBy("");
            }).to.throwError();
        });

        it("should return a reference to itself", function () {
            modelCollection.push(octocatModelsSortedByName);
           expect(modelCollection.sortBy("name")).to.be.equal(modelCollection);
        });

        it("should (natural-)sort collection by 'name'", function () {

            modelCollection.push(octocatModels);

            modelCollection.sortBy("name");

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be.equal(octocatModelsSortedByName[index]);
            });

        });

        it("should (natural-)sort collection by 'birthday'", function () {

            modelCollection.push(octocatModels);

            modelCollection.sortBy("birthday");

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be.equal(octocatModelsSortedByDate[index]);
            });

        });

        it("should (natual-)sort collection 'birthday desceding if true is given as second argument", function () {

            var octocatModelsSortedByDateReverse = octocatModelsSortedByDate.reverse();

            modelCollection.push(octocatModelsSortedByDate);

            modelCollection.sortBy("birthday", true);

            modelCollection.each(function eachIterator(model, index) {
                expect(model).to.be.equal(octocatModelsSortedByDateReverse[index]);
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

    describe("dispose()", function () {

        it("should remove 'change'-listeners from all Models", function () {
            var changeCallCount = 0;
            modelCollection.on("change", function onChange() {
                changeCallCount++;
            });
            modelCollection.push(octocatModels);
            modelCollection.dispose();
            _(octocatModels).each(function triggerChange(model, index) {
                model.set("name", "" + index + "");
            });
            expect(changeCallCount).to.be.equal(0);
        });

    });
});