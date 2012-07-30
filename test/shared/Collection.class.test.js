"use strict";

// @browser ./testHelpers/compileAlamidClient.js
require("./testHelpers/compileAlamid.js");

var expect = require("expect.js"),
    is = require("nodeclass").is,
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    CollectionExample = require("./Collection/CollectionExample.class.js"),
    EventEmitter  = require("../../lib/shared/EventEmitter.class.js"),
    OctocatModel = require("./Model/Octocat.class.js");



describe("Collection", function () {

    var collection,
        octocatModel,
        octocatModels;

    beforeEach(function () {
        collection = new Collection(OctocatModel);
        octocatModel = new OctocatModel();
        octocatModels = [octocatModel, new OctocatModel(), new OctocatModel()];
    });

    describe(".construct()", function () {

        it("should be instance of EventEmitter", function () {
            expect(is(collection).instanceOf(EventEmitter)).to.be.ok();
        });

        it("should be possible to pass as second argument model(s)", function () {
            collection = new CollectionExample(OctocatModel, octocatModels);
            expect(collection.getElements()).to.be.eql(octocatModels);
        });

        it("should throw an Error if as second argument not a model or an array of models was passed", function () {
            expect(function () {
                collection = new CollectionExample(OctocatModel, [{}]);
            }).to.throwError();
        });

    });

    describe(".getClass()", function () {

        it("should return Model as null", function () {
            collection = new Collection();
            expect(collection.getClass()).to.be.equal(null);
        });

        it("should return OctocatClass", function () {
            expect(collection.getClass()).to.be.equal(OctocatModel);
        });

    });

    describe(".set()", function () {

        it("should throw an Error if no instance of set ModelClass is given", function () {
            expect(function () {
                collection.set(0, {});
            }).to.throwError();
        });

        it("should throw 'change'-Event ", function (done) {
            collection.on("change", function onChange() {
                done();
            });
            collection.set(1, octocatModel);
        });

        it("should return a reference to itself", function () {
            expect(collection.set(0, octocatModel)).to.be.equal(collection);
        });

    });

    describe(".get()", function () {

        it("should return the set Model at given index", function () {
            collection.set(3, octocatModel);
            expect(collection.get(3)).to.be.equal(octocatModel);
        });

    });

    describe(".push()", function () {

        it("should throw an Error if no instance of Model was given", function () {
            expect(function () {
                collection.push({});
            }).to.throwError();
        });

        it("should throw an Error if an Array containing an element not instance of Model was given", function () {
            expect(function () {
                collection.push([octocatModel, {}]);
            }).to.throwError();
        });

        it("should be possible to push a single Model", function (done) {
            collection.push(octocatModel);
            done();
        });

        it("should be possible to push an Array of Models", function (done) {
            collection.push(octocatModels);
            done();
        });

        it("should return a reference to itself", function () {
            expect(collection.push(octocatModel)).to.be.equal(collection);
        });

        it("should emit an 'change'-Event if a Model was pushed", function (done) {
            collection.on("change", function onChange() {
                done();
            });
            collection.push(octocatModel);
        });

    });

    describe(".unshift()", function () {

        it("should throw an Error if no instance of Model was given", function () {
            expect(function () {
                collection.unshift({});
            }).to.throwError();
        });

        it("should throw an Error if an Array containing an element not instance of Model was given", function () {
            expect(function () {
                collection.unshift([octocatModel, {}]);
            }).to.throwError();
        });

        it("should be possible to unshift a single Model", function (done) {
            collection.unshift(octocatModel);
            done();
        });

        it("should be possible to unshift an Array of Models", function (done) {
            collection.unshift(octocatModels);
            done();
        });

        it("should return a reference to itself", function () {
            expect(collection.unshift(octocatModel)).to.be.equal(collection);
        });

        it("should emit an 'change'-Event if a Model was pushed", function (done) {
            collection.on("change", function onChange() {
                done();
            });
            collection.unshift(octocatModel);
        });

    });

    describe(".size()", function () {

        it("should have a default length of 0", function () {
            expect(collection.size()).to.be.equal(0);
        });

        it("should have the same as pushed array", function () {
            collection.push(octocatModels);
            expect(collection.size()).to.be.equal(octocatModels.length);
        });

    });

    describe(".each()", function () {

        it("should be possible to iterate over collection", function () {
            collection.push(octocatModels);

            collection.each( function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

    });

    describe(".pop()", function () {

        it("should return the last element", function () {
            collection.push(octocatModels);
            expect(collection.pop()).to.be.equal(octocatModels.pop());
        });

        it("should remove the last element", function () {
            collection.push(octocatModels);
            collection.pop();
            octocatModels.pop();
            collection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

        it("should emit 'change'-Event", function (done) {
            collection.push(octocatModel);
            collection.on("change", function onChange() {
                done();
            });
            collection.pop();
        });

        it("should not emit 'change'-Event if a popped model emits it's 'change'-Event", function (done) {
            collection.push(octocatModel); //must be pushed first because after 'change' will be emitted
            collection.pop();
            collection.on("change", function onChange() {
                done(); //Should not be executed
            });
            octocatModel.emit("change");
            done();
        });

    });

    describe(".shift()", function () {

        it("should return the first element", function () {
            collection.push(octocatModels);
            expect(collection.shift()).to.be.equal(octocatModels.shift());
        });

        it("should remove the first element", function () {
            collection.push(octocatModels);
            collection.shift();
            octocatModels.shift();
            collection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be.equal(octocatModels[index]);
            });
        });

        it("should emit 'change'-Event", function (done) {
            collection.push(octocatModel);
            collection.on("change", function onChange() {
                done();
            });
            collection.shift();
        });

        it("should not emit 'change'-Event if a shifted model emits it's 'change'-Event", function (done) {
            collection.push(octocatModel); //must be pushed first because after 'change' will be emitted
            collection.shift();
            collection.on("change", function onChange() {
                done(); //Should not be executed
            });
            octocatModel.emit("change");
            done();
        });

    });

    describe(".toArray", function () {

        it("should return an array", function () {
            expect(collection.toArray()).to.be.an(Array);
        });

        it("should return an array with all passed Model", function () {
            collection.set(0, octocatModels[0]);
            collection.push([octocatModels[1], octocatModels[2]]);

            expect(collection.toArray()).to.be.eql([octocatModels[0], octocatModels[1], octocatModels[2]]);
        });

    });

    describe(".reverse()", function () {

        it("should reverse te order", function () {
            collection.push(octocatModels);
            collection.reverse();
            octocatModels.reverse();
            collection.each(function modelCollectionIterator(model, index) {
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
            expect(collection.filter(function () {})).to.be.an(Array);
        });

        it("should return an Array filtered by given filter", function () {

            function filterIterator(model, index) {
                return model.get("name") !== octocatModels[2].get("name");
            }

            collection.push(octocatModels);

            expect(collection.filter(filterIterator)).to.be.eql(_(octocatModels).filter(filterIterator));

        });

    });

    describe(".dispose()", function () {

        it("should remove all listeners from it's Models", function (done) {
            collection.set(0, octocatModel);
            collection.on("change", function onChange() {
                done();
            });
            collection.dispose();
            done();
        });

        it("should make itself unusable", function () {
            collection.dispose();
            expect(collection.toArray()).to.be.equal(null);
        });

    });


    describe(".setMuted()", function () {

        it("should not emit 'change'-Event after true was passed", function (done) {
            collection.setMuted(true);
            collection.on("change", function () {
                done();
            });
            collection.push(octocatModel);
            done();
        });

        it("should emit 'change'-Event after false was re-passed", function (done) {
            collection.setMuted(true);
            collection.on("change", function onChangeOnce() {
                done();
            });
            collection.setMuted(false);
            collection.push(octocatModel);
        });

    });

});