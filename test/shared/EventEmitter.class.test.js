"use strict";

var expect = require("expect.js");

var EventEmitter = require("../../lib/shared/EventEmitter.class.js"),
    Disposable = require("../../lib/shared/Disposable.class.js"),
    NodeEventEmitter = require("events").EventEmitter;

// These tests only check the basic functionality.
// Detailed checks should be done by the node-lib or their replacements for the web
describe("EventEmitter", function () {

    var e,
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
        e = new EventEmitter();
        aCalled = 0;
        bCalled = 0;
        cCalled = 0;
    });

    describe("#constructor()", function () {
        it("should return an instance of Disposable", function () {
            expect(e).to.be.an(Disposable);
        });
    });

    describe("#on()", function () {
        it("should be an alias for .addListener()", function () {
            expect(e.on).to.be(e.addListener);
        });
    });

    describe("#emit() / #addListener()", function () {
        it("should execute the listener each time the event was triggered", function () {
            e.addListener("snacktime", a);
            e.emit("snacktime");
            e.emit("snacktime");
            e.emit("snacktime");

            expect(aCalled).to.be(3);
        });
    });

    describe("#emit()", function () {
        it("should pass all params to the listener", function (done) {

            e.on("snacktime", function onSnacktime(a, b, c) {

                expect(a).to.be(1);
                expect(b).to.be(2);
                expect(c).to.be(3);

                done();
            });

            e.emit("snacktime", 1, 2, 3);
        });
    });



    describe("#once()", function () {
        it("should trigger the listener only once", function () {
            e.once("snacktime", a);
            e.emit("snacktime");
            e.emit("snacktime");
            e.emit("snacktime");

            expect(aCalled).to.be(1);
        });
    });

    describe("#removeListener()", function () {
        it("should not trigger the removed listener", function () {
            e.on("snacktime", a);
            e.on("snacktime", b);
            e.removeListener("snacktime", a);
            e.emit("snacktime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(1);
        });
    });

    describe("#removeAllListeners()", function () {
        it("should not trigger any event listener to the given event", function () {
            e.on("snacktime", a);
            e.on("snacktime", b);
            e.on("lunchtime", c);

            e.removeAllListeners("snacktime");

            e.emit("snacktime");
            e.emit("lunchtime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(0);
            expect(cCalled).to.be(1);
        });

        it("should not trigger any event-listener", function () {
            e.on("snacktime", a);
            e.on("brunchtime", b);
            e.on("lunchtime", c);

            e.removeAllListeners();

            e.emit("snacktime");
            e.emit("brunchtime");
            e.emit("lunchtime");

            expect(aCalled).to.be(0);
            expect(bCalled).to.be(0);
            expect(cCalled).to.be(0);
        });

    });

    describe("#listeners()", function () {

        it("should return all attached listeners", function () {
            e.on("snacktime", a);
            e.on("snacktime", b);

            expect(e.listeners("snacktime")).to.eql([a, b]);
        });

    });

    describe("#dispose()", function () {

        it("should call NodeEventEmitter.prototype.removeAllListeners()", function () {
            var removeAllListeners = NodeEventEmitter.prototype.removeAllListeners;

            NodeEventEmitter.prototype.removeAllListeners = a;
            e.dispose();
            expect(aCalled).to.be(1);

            NodeEventEmitter.prototype.removeAllListeners = removeAllListeners;
        });

        it("should call Disposable.prototype.dispose()", function () {
            e.dispose();
            // Can't be checked better
            // @see https://github.com/peerigon/alamid-class/issues/7
            expect(e._runOnDispose).to.be(null);
        });

    });

});