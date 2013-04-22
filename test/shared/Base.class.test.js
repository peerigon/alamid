"use strict";

var expect = require("expect.js");

var Base = require("../../lib/shared/Base.class.js"),
    NodeEventEmitter = require("events").EventEmitter;

// These tests only check the basic functionality.
// Detailed checks should be done by the node-lib or their replacements for the web
describe("Base", function () {

    var base,
        aCalled,
        bCalled,
        cCalled;

    function a() {
        aCalled++;
    }

    function b() {
        bCalled++;
    }

    function c() {
        cCalled++;
    }

    beforeEach(function () {
        base = new Base();
        aCalled = 0;
        bCalled = 0;
        cCalled = 0;
    });

    describe("#constructor()", function () {

        it("should return an instance of NodeEventEmitter", function () {
            expect(base).to.be.an(NodeEventEmitter);
        });

    });

    describe("#on()", function () {

        it("should be an alias for .addListener()", function () {
            expect(base.on).to.be(base.addListener);
        });

    });

    describe("#emit() / #addListener()", function () {

        it("should execute the listener each time the event was triggered", function () {
            base.addListener("snacktime", a);
            base.emit("snacktime");
            base.emit("snacktime");
            base.emit("snacktime");

            expect(aCalled).to.be(3);
        });

    });

    describe("#emit()", function () {

        it("should pass all params to the listener", function (done) {

            base.on("snacktime", function onSnacktime(a, b, c) {

                expect(a).to.be(1);
                expect(b).to.be(2);
                expect(c).to.be(3);

                done();
            });

            base.emit("snacktime", 1, 2, 3);
        });

    });



    describe("#once()", function () {

        it("should trigger the listener only once", function () {
            base.once("snacktime", a);
            base.emit("snacktime");
            base.emit("snacktime");
            base.emit("snacktime");

            expect(aCalled).to.be(1);
        });

    });

    describe("#removeListener()", function () {

        it("should not trigger the removed listener", function () {
            base.on("snacktime", a);
            base.on("snacktime", b);
            base.removeListener("snacktime", a);
            base.emit("snacktime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(1);
        });

    });

    describe("#removeAllListeners()", function () {

        it("should not trigger any event listener to the given event", function () {
            base.on("snacktime", a);
            base.on("snacktime", b);
            base.on("lunchtime", c);

            base.removeAllListeners("snacktime");

            base.emit("snacktime");
            base.emit("lunchtime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(0);
            expect(cCalled).to.be(1);
        });

        it("should not trigger any event-listener", function () {
            base.on("snacktime", a);
            base.on("brunchtime", b);
            base.on("lunchtime", c);

            base.removeAllListeners();

            base.emit("snacktime");
            base.emit("brunchtime");
            base.emit("lunchtime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(0);
            expect(cCalled).to.be(0);
        });

    });

    describe("#listeners()", function () {

        it("should return all attached listeners", function () {
            base.on("snacktime", a);
            base.on("snacktime", b);

            expect(base.listeners("snacktime")).to.eql([a, b]);
        });

    });

    describe("#dispose()", function () {

        it("should call NodeEventEmitter.prototype.removeAllListeners()", function () {
            var removeAllListeners = NodeEventEmitter.prototype.removeAllListeners;

            NodeEventEmitter.prototype.removeAllListeners = a;
            base.dispose();
            expect(aCalled).to.be(1);

            NodeEventEmitter.prototype.removeAllListeners = removeAllListeners;
        });

        it("should emit a dispose event", function (done) {
            base.on("dispose", function (e) {
                expect(e.name).to.be("DisposeEvent");
                done();
            });
            base.dispose();
        });

    });

    describe("#isDisposed() / #dispose()", function () {

        it("should be false if dispose() hasn't been called", function () {
            expect(base.isDisposed()).to.be(false);
        });

        it("should return true if dispose() has been called", function () {
            base.dispose();
            expect(base.isDisposed()).to.be(true);
        });

    });


});