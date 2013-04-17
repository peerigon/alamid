"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Disposable = require("../../lib/shared/Disposable.class.js");

describe("Disposable", function () {
    var disposable,
        context;

    function test() {
        context = this;
    }

    beforeEach(function () {
        disposable = new Disposable();
    });
    describe("#runOnDispose()", function () {
        it("should not execute the function before dispose() has been called", function () {
            disposable.runOnDispose(test);
            expect(context).to.be(undefined);
        });
        it("should be chainable", function () {
            expect(disposable.runOnDispose(test)).to.be(disposable);
        });
    });
    describe("#addDisposable()", function () {
        it("should be chainable", function () {
            var disp = {
                dispose: test
            };

            expect(disposable.addDisposable(disp)).to.be(disposable);
        });
    });
    describe("#dispose() / #runOnDispose()", function () {
        it("should execute the function with the disposable as context", function () {
            disposable.runOnDispose(test);
            disposable.dispose();
            expect(context).to.be(disposable);
        });
    });
    describe("#dispose() / #addDisposable()", function () {
        it("should dispose all registered disposables", function () {
            var calledOn = [],
                disp1 = {},
                disp2 = {},
                disp3 = {};

            function disposeMock() {
                calledOn.push(this);
            }

            disp1.dispose = disp2.dispose = disp3.dispose = disposeMock;

            disposable.addDisposable(disp1);
            disposable.addDisposable(disp2);
            disposable.addDisposable(disp3);

            disposable.dispose();

            expect(calledOn).to.eql([disp1, disp2, disp3]);
        });
    });
    describe("#watch() / #runOnDispose()", function () {
        var expectedReturn = {},
            eventEmitter = {
                on: function (eventName, listener) {
                    actualEventName = eventName;
                    actualListener = listener;

                    return expectedReturn;
                },
                removeListener: function (eventName, listener) {
                    actualEventName = eventName;
                    actualListener = listener;
                }
            },
            actualEventName,
            actualListener,
            actualReturn;

        function listener() {}

        beforeEach(function () {
            actualEventName = null;
            actualListener = null;
            actualReturn = null;
        });

        it("should proxy the .on()-call", function () {
            actualReturn = disposable.watch(eventEmitter).on("snacktime", listener);

            expect(actualEventName).to.be("snacktime");
            expect(actualListener).to.be(listener);
            expect(actualReturn).to.be(expectedReturn);
        });
        it("should call .removeListener() with the given event name and listener on dispose()", function () {
            disposable.watch(eventEmitter).on("lunchtime", listener);
            disposable.dispose();

            expect(actualEventName).to.be("lunchtime");
            expect(actualListener).to.be(listener);
        });
    });
});