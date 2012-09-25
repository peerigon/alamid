"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    CollectionExample = require("./Collection/CollectionExample.class.js"),
    DefinedCollectionExample = require("./Collection/DefinedCollectionExample.class.js"),
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

        it("should throw an Error if no Class was given as", function () {
            expect(function () {
                collection = new Collection();
            }).to.throwError();
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

    describe(".define()", function describeDefine() {

        it("should create a new instance of Collection", function () {
            var collection = new DefinedCollectionExample(OctocatModel);

            expect(is(collection).instanceOf(Collection)).to.be(true);
        });

        it("should provide described method ", function (done) {
            collection = new DefinedCollectionExample(OctocatModel);
            collection.executeDone(done);
        });

    });

    describe(".toArray", function () {

        it("should return an array", function () {
            expect(collection.toArray()).to.be.an("array");
        });

        it("should return an array with all passed Model", function () {
            collection.set(0, octocatModels[0]);
            collection.push([octocatModels[1], octocatModels[2]]);

            expect(collection.toArray()).to.be.eql([octocatModels[0], octocatModels[1], octocatModels[2]]);
        });

    });

    describe(".getClass()", function () {

        it("should return OctocatClass", function () {
            expect(collection.getClass()).to.be.equal(OctocatModel);
        });

    });

    describe(".set()", function () {

        it("should throw an Error if a negative index was given", function () {
            expect(function () {
                collection.set(-1, octocatModel);
            }).to.throwError();
        });

        it("should throw an Error if no instance of set ModelClass is given", function () {
            expect(function () {
                collection.set(0, {});
            }).to.throwError();
        });

        it("should emit an 'add'-Event ", function (done) {
            collection.on("add", function () {
                done();
            });
            collection.set(0, octocatModel);
        });

        it("should pass index of set element as second argument", function (done) {
            collection.on("add", function (elements, index) {
                expect(index).to.be.equal(9);
                done();
            });
            collection.set(9, octocatModel);
        });

        it("should pass set element as first argument and as array", function (done) {
            collection.on("add", function (elements) {
                expect(elements[0]).to.be.equal(octocatModel);
                done();
            });
            collection.set(3, octocatModel);
        });

        it("should pass (isMutated===)true as third argument if no index was overwritten", function (done) {
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be.equal(true);
                done();
            });
            collection.set(0, octocatModel);
        });

        it("should pass (isMutated===)false as third argument if no index was overwritten", function (done) {
            collection.set(1, octocatModels[2]);
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be.equal(false);
                done();
            });
            collection.set(1, octocatModels[1]);
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

        it("should be possible to push a Collection", function () {
            var reference = octocatModels.concat(octocatModels[0], octocatModels[1], octocatModels[2]),
                newCollection = new Collection(OctocatModel, octocatModels),
                previousCollectionSize = collection.size();

            collection.push(newCollection);

            expect(collection.size()).to.equal(previousCollectionSize + octocatModels.length);
            _(collection.toArray()).each(function compareCollection(element, index) {
                expect(element).to.equal(reference[index]);
            });
        });

        it("should return a reference to itself", function () {
            expect(collection.push(octocatModel)).to.be.equal(collection);
        });

        it("should emit an 'add'-Event", function (done) {
            collection.on("add", function onAdd() {
                done();
            });
            collection.push(octocatModels);
        });

        it("should pass pushed element as first argument and as Array on 'add'", function (done) {
            collection.on("add", function (elements) {
                expect(elements).to.be.an(Array);
                expect(elements[0]).to.be.equal(octocatModel);
                done();
            });
            collection.push(octocatModel);
        });

        it("should pass the index where elements was pushed as second argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("add", function onAdd(elements, index) {
                expect(index).to.be.equal(octocatModels.length);
                done();
            });
            collection.push(octocatModels);
        });

        it("should pass (isMutated ===)true as third argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be.equal(true);
                done();
            });
            collection.push(octocatModels);
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

        it("should be possible to unshift a Collection", function () {
            var reference = octocatModels.concat(octocatModels[0], octocatModels[1], octocatModels[2]),
                newCollection = new Collection(OctocatModel, octocatModels),
                previousCollectionSize = collection.size();

            collection.unshift(newCollection);

            expect(collection.size()).to.equal(previousCollectionSize + octocatModels.length);
            _(collection.toArray()).each(function compareCollection(element, index) {
                expect(element).to.equal(reference[index]);
            });
        });

        it("should emit an 'add'-Event", function (done) {
            collection.on("add", function onAdd() {
                done();
            });
            collection.unshift(octocatModel);
        });

        it("should pass unshifted elements as first argument and as array on 'add'", function (done) {
            collection.on("add", function onAdd(elements) {
                expect(elements).to.be.an(Array);
                expect(elements[0]).to.be.equal(octocatModel);
                done();
            });
            collection.unshift(octocatModel);
        });

        it("should pass 0 as index and second argument on 'add'", function (done) {
            collection.unshift(octocatModels);
            collection.on("add", function onAdd(elements, index) {
                expect(index).to.be.equal(0);
                done();
            });
            collection.unshift(octocatModels);
        });

        it("should pass (isMutated ===)true as third argument on 'add'", function(done) {
            collection.unshift(octocatModels);
            collection.on("add", function onAdd(elements, index, isMutated) {
                expect(isMutated).to.be.equal(true);
                done();
            });
            collection.unshift(octocatModels);
        });

        it("should return a reference to itself", function () {
            expect(collection.unshift(octocatModel)).to.be.equal(collection);
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

        it("should emit an 'remove'-Event", function (done) {
            collection.on("remove", function onRemove() {
                done();
            });
            collection.pop();
        });

        it("should pass popped element as first argument and as array on 'remove'", function (done) {
            collection.on("remove", function onRemove(elements) {
                expect(elements).to.be.an(Array);
                expect(elements[0]).to.be.equal(octocatModels.pop());
                done();
            });
            collection.push(octocatModels);
            collection.pop();
        });

        it("should pass index from where element was popped as second argument on 'remove'", function (done) {
            collection.on("remove", function (elements, index) {
                expect(index).to.be.equal(10);
                done();
            });
            collection.set(10, octocatModel);
            collection.pop();
        });

        it("should pass (isMutated ===)true as thrid argument on 'remove'", function (done) {
            collection.on("remove", function onRemove(elements, index, isMutated) {
                expect(isMutated).to.be.equal(true);
                done();
            });
            collection.push(octocatModels);
            collection.pop();
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

        it("should emit 'remove'-Event", function (done) {
            collection.on("remove", function onRemove() {
                done();
            });
            collection.shift();
        });

        it("should pass shifted element as first argument and as Array on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("remove", function onRemove(elements) {
                expect(elements).to.be.an(Array);
                expect(elements[0]).to.be.equal(octocatModels.shift());
                done();
            });
            collection.shift();
        });

        it("should pass index 0 as second argument on 'add'", function (done) {
            collection.on("remove", function onRemove(elements, index) {
                expect(index).to.be.equal(0);
                done();
            });
            collection.shift();
        });

        it("should pass (isMutated===)true as  as third argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("remove", function onRemove(elements, index, isMutated) {
                expect(isMutated).to.be.equal(true);
                done();
            });
            collection.shift();
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

    describe(".setMuted()", function () {

        it("should not emit 'change'-Event after true was passed", function (done) {
            collection.setMuted(true);
            collection.on("change", function () {
                done();
            });
            collection.push(octocatModel);
            done();
        });

        it("should emit 'push'-Event after false was re-passed", function (done) {
            collection.setMuted(true);
            collection.on("add", function onChangeOnce() {
                done();
            });
            collection.setMuted(false);
            collection.push(octocatModel);
        });

    });

});