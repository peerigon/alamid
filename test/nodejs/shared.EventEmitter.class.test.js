"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    EventEmitter = require("../../compiled/shared/EventEmitter.class.js");

describe("EventEmitter", function () {

    var e,
        event = "snacktime";

    beforeEach(function () {
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

    describe("emit() passed params", function () {

        it("should pass all params to '" + event + "'-handler", function (done) {
            var arg0 = "a",
                arg1 = 1,
                arg2 = [],
                arg3 = {},
                arg4 = new Error(),
                arg5 = function f() { };

            e.on(event, function () {

                expect(arguments[0]).to.be.equal(arg0);
                expect(arguments[1]).to.be.equal(arg1);
                expect(arguments[2]).to.be.equal(arg2);
                expect(arguments[3]).to.be.equal(arg3);
                expect(arguments[4]).to.be.equal(arg4);
                expect(arguments[5]).to.be.equal(arg5);

                done();
            });

            e.emit(event, arg0, arg1, arg2, arg3, arg4, arg5);
        });

    });



    describe("once()", function () {

        it("should trigger '" + event + "'-handler only once", function () {
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

        it("console.error() and console.trace() shuold be executed if max listeners limit was exceeded", function (done) {
            var RewiredEventEmitter = rewire("../../compiled/shared/EventEmitter.class.js", false),
                isErrorExecuted = false;

            RewiredEventEmitter.__set__({
                console: {
                    error: function () {
                        isErrorExecuted = true;
                    },
                    trace: function () {
                        if (isErrorExecuted) {
                            done();
                        }
                    }
                }
            });

            e = new RewiredEventEmitter();

            e.setMaxListeners(1);

            e.on(event, function () { /*do nothing*/ });
            e.on(event, function () { /*do nothing*/ });
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