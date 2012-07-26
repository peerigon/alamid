"use strict";

require("nodeclass").registerExtension();

var expect = require("expect.js"),
    is = require("nodeclass").is,
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    EventEmitter  = require("../../lib/shared/EventEmitter.class.js"),
    OctocatModel = require("./Model/Octocat.class.js");



describe("ModelCollection", function () {

    var modelCollection,
        octocatModel,
        octocatModels;

    beforeEach(function () {
        modelCollection = new Collection(OctocatModel);
        octocatModel = new OctocatModel();
        octocatModels = [octocatModel, new OctocatModel(), new OctocatModel()];
    });

    describe(".construct()", function () {

        it("should be instance of EventEmitter", function () {
            expect(is(modelCollection).instanceOf(EventEmitter)).to.be.ok();
        });

    });

    describe(".getClass()", function () {

        it("should return Model as null", function () {
            modelCollection = new Collection();
            expect(modelCollection.getClass()).to.be.equal(null);
        });

        it("should return OctocatClass", function () {
            expect(modelCollection.getClass()).to.be.equal(OctocatModel);
        });

    });

    describe(".set()", function () {

        it("should throw an Error if no instance of set ModelClass is given", function () {
            expect(function () {
                modelCollection.set(0, {});
            }).to.throwError();
        });

        it("should throw 'change'-Event ", function (done) {
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.set(1, octocatModel);
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.set(0, octocatModel)).to.be.equal(modelCollection);
        });

    });

    describe(".get()", function () {

        it("should return the set Model at given index", function () {
            modelCollection.set(3, octocatModel);
            expect(modelCollection.get(3)).to.be.equal(octocatModel);
        });

    });

    describe(".push()", function () {

        it("should throw an Error if no instance of Model was given", function () {
            expect(function () {
                modelCollection.push({});
            }).to.throwError();
        });

        it("should throw an Error if an Array containing an element not instance of Model was given", function () {
            expect(function () {
                modelCollection.push([octocatModel, {}]);
            }).to.throwError();
        });

        it("should be possible to push a single Model", function (done) {
            modelCollection.push(octocatModel);
            done();
        });

        it("should be possible to push an Array of Models", function (done) {
            modelCollection.push(octocatModels);
            done();
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.push(octocatModel)).to.be.equal(modelCollection);
        });

        it("should emit an 'change'-Event if a Model was pushed", function (done) {
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.push(octocatModel);
        });

    });

    describe(".unshift()", function () {

        it("should throw an Error if no instance of Model was given", function () {
            expect(function () {
                modelCollection.unshift({});
            }).to.throwError();
        });

        it("should throw an Error if an Array containing an element not instance of Model was given", function () {
            expect(function () {
                modelCollection.unshift([octocatModel, {}]);
            }).to.throwError();
        });

        it("should be possible to unshift a single Model", function (done) {
            modelCollection.unshift(octocatModel);
            done();
        });

        it("should be possible to unshift an Array of Models", function (done) {
            modelCollection.unshift(octocatModels);
            done();
        });

        it("should return a reference to itself", function () {
            expect(modelCollection.unshift(octocatModel)).to.be.equal(modelCollection);
        });

        it("should emit an 'change'-Event if a Model was pushed", function (done) {
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.unshift(octocatModel);
        });

    });

    describe(".size()", function () {

        it("should have a default length of 0", function () {
            expect(modelCollection.size()).to.be.equal(0);
        });

        it("should have the same as pushed array", function () {
            modelCollection.push(octocatModels);
            expect(modelCollection.size()).to.be.equal(octocatModels.length);
        });

    });

    describe(".each()", function () {

        it("should be possible to iterate over ModelCollection", function () {
            modelCollection.push(octocatModels);

            modelCollection.each( function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

    });

    describe(".pop()", function () {

        it("should return the last element", function () {
            modelCollection.push(octocatModels);
            expect(modelCollection.pop()).to.be.equal(octocatModels.pop());
        });

        it("should remove the last element", function () {
            modelCollection.push(octocatModels);
            modelCollection.pop();
            octocatModels.pop();
            modelCollection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

        it("should emit 'change'-Event", function (done) {
            modelCollection.push(octocatModel);
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.pop();
        });

        it("should not emit 'change'-Event if a popped model emits it's 'change'-Event", function (done) {
            modelCollection.push(octocatModel); //must be pushed first because after 'change' will be emitted
            modelCollection.pop();
            modelCollection.on("change", function onChange() {
                done(); //Should not be executed
            });
            octocatModel.emit("change");
            done();
        });

    });

    describe(".shift()", function () {

        it("should return the first element", function () {
            modelCollection.push(octocatModels);
            expect(modelCollection.shift()).to.be.equal(octocatModels.shift());
        });

        it("should remove the first element", function () {
            modelCollection.push(octocatModels);
            modelCollection.shift();
            octocatModels.shift();
            modelCollection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

        it("should emit 'change'-Event", function (done) {
            modelCollection.push(octocatModel);
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.shift();
        });

        it("should not emit 'change'-Event if a shifted model emits it's 'change'-Event", function (done) {
            modelCollection.push(octocatModel); //must be pushed first because after 'change' will be emitted
            modelCollection.shift();
            modelCollection.on("change", function onChange() {
                done(); //Should not be executed
            });
            octocatModel.emit("change");
            done();
        });

    });

    describe(".toArray", function () {

        it("should return an array", function () {
            expect(modelCollection.toArray()).to.be.an(Array);
        });

        it("should return an array with all passed Model", function () {
            modelCollection.set(0, octocatModels[0]);
            modelCollection.push([octocatModels[1], octocatModels[2]]);

            expect(modelCollection.toArray()).to.be.eql([octocatModels[0], octocatModels[1], octocatModels[2]]);
        });

    });

    describe(".reverse()", function () {

        it("should reverse te order", function () {
            modelCollection.push(octocatModels);
            modelCollection.reverse();
            octocatModels.reverse();
            modelCollection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

    });

    describe(".filter()", function () {

        beforeEach(function () {
            octocatModels[0].set("name", "a 3");
            octocatModels[1].set("name", "a 1");
            octocatModels[2].set("name", "b 9999 c");
        });

        it("should return an Array", function () {
            expect(modelCollection.filter(function () {})).to.be.an(Array);
        });

        it("should return an Array filtered by given filter", function () {

            function filterIterator(model, index) {
                return model.get("name") !== octocatModels[2].get("name");
            }

            modelCollection.push(octocatModels);

            expect(modelCollection.filter(filterIterator)).to.be.eql(_(octocatModels).filter(filterIterator));

        });

    });

    describe(".dispose()", function () {

        it("should remove all listeners from it's Models", function (done) {
            modelCollection.set(0, octocatModel);
            modelCollection.on("change", function onChange() {
                done();
            });
            modelCollection.dispose();
            done();
        });

        it("should make itself unusable", function () {
            modelCollection.dispose();
            expect(modelCollection.toArray()).to.be.equal(null);
        });

    });


    describe(".setMuted()", function () {

        it("should not emit 'change'-Event after true was passed", function (done) {
            modelCollection.setMuted(true);
            modelCollection.on("change", function () {
                done();
            });
            modelCollection.push(octocatModel);
            done();
        });

        it("should emit 'change'-Event after false was re-passed", function (done) {
            modelCollection.setMuted(true);
            modelCollection.on("change", function onChangeOnce() {
                done();
            });
            modelCollection.setMuted(false);
            modelCollection.push(octocatModel);
        });

    });

});