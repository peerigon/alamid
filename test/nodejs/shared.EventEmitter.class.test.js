"use strict";

var expect = require("expect.js"),
    EventEmitter = require("../../compiled/shared/EventEmitter.class.js");

describe("EventEmitter", function () {

    var e,
        event = "snacktime";

    before(function () {
        e = new EventEmitter();
    });

    describe("emit(), on()", function () {

        it("should execute each time " + event + " was triggered 'snacktime'-handler", function () {
            var onSnacktimeCalls = 0,
                desiredOnSnacktimeCalls = 2,
                emitCount = desiredOnSnacktimeCalls;

            function onSnacktime() {
                ++onSnacktimeCalls;
            }

            e.on(event, onSnacktime);

            for(var i = 0; i < emitCount; ++i) {
                e.emit(event);
            }

            expect(onSnacktimeCalls).to.be.equal(desiredOnSnacktimeCalls);
        });

    });

    describe("emit(), addListener()", function () {

        it("should execute each time " + event + " was triggered 'snacktime'-handler", function () {
            var onSnacktimeCalls = 0,
                desiredOnSnacktimeCalls = 2,
                emitCount = desiredOnSnacktimeCalls;

            function onSnacktime() {
                ++onSnacktimeCalls;
            }

            e.addListener(event, onSnacktime);

            for(var i = 0; i < emitCount; ++i) {
                e.emit(event);
            }

            expect(onSnacktimeCalls).to.be.equal(desiredOnSnacktimeCalls);
        });

    });

    describe("once()", function () {

        it("should trigger 'snacktime'-handler only once", function () {
            var onSnacktimeCalls = 0,
                desiredOnSnacktimeCalls = 1,
                emitCount = 2;

            function onSnacktime() {
                ++onSnacktimeCalls;
            }

            e.once(event, onSnacktime);

            for(var i = 0; i < emitCount; ++i) {
                e.emit(event);
            }

            expect(onSnacktimeCalls).to.be.equal(desiredOnSnacktimeCalls);
        });

    });

    describe("removeListener()", function () {

        it("should not trigger onSnacktime-handler after it was removed, but 'lunchtime'-handler shall be executed", function () {
            var isSnacktimeExecuted = false,
                isLunchtimeExecuted = false;

            function onSnacktime() {
                isSnacktimeExecuted = true;
            }

            function onLunchtime() {
                isLunchtimeExecuted = true;
            }

            e.on(event, onSnacktime);
            e.on(event, onLunchtime);

            e.removeListener(event, onSnacktime);

            e.emit(event);

            expect(isSnacktimeExecuted).to.be.equal(false);
            expect(isLunchtimeExecuted).to.be.equal(true);
        });
    });

    describe("removeAllListeners()", function () {

        it("should not trigger any 'snacktime'-handler", function () {
            var isSnacktimeExecuted = false,
                isLunchtimeExecuted = false,
                isBrunchtimeExecuted = false,
                brunchtimeEvent = "brunchtime";

            function onSnacktime() {
                isSnacktimeExecuted = true;
            }

            function onLunchtime() {
                isLunchtimeExecuted = true;
            }

            function onBrunchtime() {
                isBrunchtimeExecuted = true;
            }

            e.on(event, onSnacktime);
            e.on(event, onLunchtime);
            e.on(brunchtimeEvent, onBrunchtime);

            e.removeAllListeners(event, onSnacktime);

            e.emit(event);
            e.emit(brunchtimeEvent);

            expect(isSnacktimeExecuted).to.be.equal(false);
            expect(isLunchtimeExecuted).to.be.equal(false);
            expect(isBrunchtimeExecuted).to.be.equal(true);
        });

        it("should not trigger any event-handler", function () {
            var isSnacktimeExecuted = false,
                isBrunchtimeExecuted = false,
                brunchtimeEvent = "brunchtime";

            function onSnacktime() {
                isSnacktimeExecuted = true;
            }

            function onBrunchtime() {
                isBrunchtimeExecuted = true;
            }

            e.on(event, onSnacktime);
            e.on(brunchtimeEvent, onBrunchtime);

            e.removeAllListeners();

            e.emit(event);
            e.emit(brunchtimeEvent);

            expect(isSnacktimeExecuted).to.be.equal(false);
            expect(isBrunchtimeExecuted).to.be.equal(false);
        });

    });

    describe("setMaxListeners()", function () {

        it("should be possible to attach only one listener for '" + event + "'", function () {
            //@TODO with rewire
        });

    });

    describe("listeners", function () {

        it("should return all attached listeners", function () {
            function onLunchtime() { }

            function onSnacktime() { }

            e.on(event, onLunchtime);
            e.on(event, onSnacktime);

            expect(e.listeners(event)).to.be.eql([onLunchtime, onSnacktime]);
        });

    });

});