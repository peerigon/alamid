"use strict";

var expect = require("expect.js"),
    value = require("value"),
    _ = require("underscore"),
    Collection = require("../../lib/shared/Collection.class.js"),
    Base  = require("../../lib/shared/Base.class.js");

describe("Collection", function () {

    var collection,
        octocatModel,
        octocatModels;

    function OctocatModel() {}

    beforeEach(function () {
        collection = new Collection(OctocatModel);
        octocatModel = new OctocatModel();
        octocatModels = [octocatModel, new OctocatModel(), new OctocatModel()];
    });

    describe(".constructor()", function () {

        it("should be instance of Base", function () {
            expect(value(collection).instanceOf(Base)).to.be.ok();
        });

        it("should default to 'Object' as Collection-Class when no Class was passed", function () {
            expect(new Collection().getClass()).to.be(Object);
        });

        it("should be possible to pass model(s) as second argument", function () {
            collection = new Collection(OctocatModel, octocatModels);
            expect(collection.toArray()).to.eql(octocatModels);
        });

        it("should throw an Error if as second argument not a model or an array of models was passed", function () {
            expect(function () {
                collection = new Collection(OctocatModel, [{}]);
            }).to.throwError();
        });

    });

    describe("muted", function () {

        it("should not emit events when it's muted", function () {
            //collection.muted = true;
            collection.on("change", function () {
                throw new Error("Event has been emitted");
            });
            collection.push(octocatModel);
        });

    });

    describe(".toArray()", function () {

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
            expect(collection.getClass()).to.be(OctocatModel);
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
                expect(index).to.be(9);
                done();
            });
            collection.set(9, octocatModel);
        });

        it("should pass set element as first argument and as array", function (done) {
            collection.on("add", function (elements) {
                expect(elements[0]).to.be(octocatModel);
                done();
            });
            collection.set(3, octocatModel);
        });

        it("should pass (isMutated===)true as third argument if no index was overwritten", function (done) {
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be(true);
                done();
            });
            collection.set(0, octocatModel);
        });

        it("should pass (isMutated===)false as third argument if no index was overwritten", function (done) {
            collection.set(1, octocatModels[2]);
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be(false);
                done();
            });
            collection.set(1, octocatModels[1]);
        });

        it("should return a reference to itself", function () {
            expect(collection.set(0, octocatModel)).to.be(collection);
        });

    });

    describe(".get()", function () {

        it("should return the set Model at given index", function () {
            collection.set(3, octocatModel);
            expect(collection.get(3)).to.be(octocatModel);
        });

    });

    describe(".remove()", function () {

        beforeEach(function () {
            collection.push(octocatModels);
        });

        it("should remove the element at given index", function () {
            collection.remove(0);
            expect(collection.toArray().length).to.equal(octocatModels.length - 1);
        });

        it("should return the removed element", function () {
           expect(collection.remove(0)).to.equal(octocatModels[0]);
        });

        it("should return undefined when an not set index was given", function () {
            expect(collection.remove(999)).to.equal(undefined);
        });

        it("should emit an 'remove'-event and pass as first argument an Array with the removed element on index 0", function (done) {

            collection.on("remove", function onRemove(elements) {
                expect(elements[0]).to.equal(octocatModels[1]);
                done();
            });

            collection.remove(1);

        });

        it("should emit an 'remove'-event and pass as second argument the index of removed element", function (done) {

            var indexToRemove = 2;

            collection.on("remove", function onRemove(elements, index) {
                expect(index).to.equal(indexToRemove);
                done();
            });

            collection.remove(indexToRemove);

        });

        it("should emit an 'remove'-event and pass (isMutated ===)true as third argument", function (done) {

            collection.on("remove", function (elements, index, isMutated) {
                expect(isMutated).to.be(true);
                done();
            });
            collection.remove(0);
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
            expect(collection.push(octocatModel)).to.be(collection);
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
                expect(elements[0]).to.be(octocatModel);
                done();
            });
            collection.push(octocatModel);
        });

        it("should pass the index where elements was pushed as second argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("add", function onAdd(elements, index) {
                expect(index).to.be(octocatModels.length);
                done();
            });
            collection.push(octocatModels);
        });

        it("should pass (isMutated ===)true as third argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("add", function (elements, index, isMutated) {
                expect(isMutated).to.be(true);
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
                expect(elements[0]).to.be(octocatModel);
                done();
            });
            collection.unshift(octocatModel);
        });

        it("should pass 0 as index and second argument on 'add'", function (done) {
            collection.unshift(octocatModels);
            collection.on("add", function onAdd(elements, index) {
                expect(index).to.be(0);
                done();
            });
            collection.unshift(octocatModels);
        });

        it("should pass (isMutated ===)true as third argument on 'add'", function(done) {
            collection.unshift(octocatModels);
            collection.on("add", function onAdd(elements, index, isMutated) {
                expect(isMutated).to.be(true);
                done();
            });
            collection.unshift(octocatModels);
        });

        it("should return a reference to itself", function () {
            expect(collection.unshift(octocatModel)).to.be(collection);
        });

    });

    describe(".size()", function () {

        it("should have a default length of 0", function () {
            expect(collection.size()).to.be(0);
        });

        it("should have the same as pushed array", function () {
            collection.push(octocatModels);
            expect(collection.size()).to.be(octocatModels.length);
        });

    });

    describe(".each()", function () {

        it("should be possible to iterate over collection", function () {
            collection.push(octocatModels);

            collection.each( function modelCollectionIterator(model, index) {
                expect(model).to.be(octocatModels[index]);
            });
        });

    });

    describe(".pop()", function () {

        it("should return the last element", function () {
            collection.push(octocatModels);
            expect(collection.pop()).to.be(octocatModels.pop());
        });

        it("should remove the last element", function () {
            collection.push(octocatModels);
            collection.pop();
            octocatModels.pop();
            collection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be(octocatModels[index]);
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
                expect(elements[0]).to.be(octocatModels.pop());
                done();
            });
            collection.push(octocatModels);
            collection.pop();
        });

        it("should pass index from where element was popped as second argument on 'remove'", function (done) {
            collection.on("remove", function (elements, index) {
                expect(index).to.be(10);
                done();
            });
            collection.set(10, octocatModel);
            collection.pop();
        });

        it("should pass (isMutated ===)true as thrid argument on 'remove'", function (done) {
            collection.on("remove", function onRemove(elements, index, isMutated) {
                expect(isMutated).to.be(true);
                done();
            });
            collection.push(octocatModels);
            collection.pop();
        });

    });

    describe(".shift()", function () {

        it("should return the first element", function () {
            collection.push(octocatModels);
            expect(collection.shift()).to.be(octocatModels.shift());
        });

        it("should remove the first element", function () {
            collection.push(octocatModels);
            collection.shift();
            octocatModels.shift();
            collection.each(function modelCollectionIterator(model, index) {
                expect(model).to.be(octocatModels[index]);
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
                expect(elements[0]).to.be(octocatModels.shift());
                done();
            });
            collection.shift();
        });

        it("should pass index 0 as second argument on 'add'", function (done) {
            collection.on("remove", function onRemove(elements, index) {
                expect(index).to.be(0);
                done();
            });
            collection.shift();
        });

        it("should pass (isMutated===)true as  as third argument on 'add'", function (done) {
            collection.push(octocatModels);
            collection.on("remove", function onRemove(elements, index, isMutated) {
                expect(isMutated).to.be(true);
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
                expect(model).to.equal(octocatModels[index]);
            });
        });

    });

    describe(".filter()", function () {

        it("should return an Array", function () {
            expect(collection.filter(function () {})).to.be.an(Array);
        });

        it("should return an Array filtered by given filter", function () {
            function filterIterator(model, index) {
                return model !== octocatModels[2];
            }

            collection.push(octocatModels);
            expect(collection.filter(filterIterator)).to.eql(_(octocatModels).filter(filterIterator));

        });

    });

    describe(".find()", function () {

        beforeEach(function () {
            collection.push(octocatModels);
        });

        it("should find searched Model", function () {
            function findIterator(model, index) {
                return model === octocatModels[2];
            }

            expect(collection.find(findIterator)).to.equal(octocatModels[2]);
       });

    });

});