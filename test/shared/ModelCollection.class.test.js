"use strict";

// @browser ./testHelpers/compileAlamidClient.js
require("./testHelpers/compileAlamid.js");

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

        it("should use Model as default class", function () {
            modelCollection = new ModelCollection();
            expect(modelCollection.getClass()).to.be.equal(Model);
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

        it("should emit 'change'-event", function (done) {

            modelCollection.push(octocatModels);

            modelCollection.on("change", function onChange() {
                done();
            });

            modelCollection.sortBy("name");
        });

    });
});