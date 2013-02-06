"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Hooks = require("../../lib/shared/Hooks.mixin.js");

var expectTypeError = function (err) {
    expect(err).to.be.a(TypeError);
};

describe("Hooks", function () {
    var hooks;

    describe("constructor", function () {
        it("should create an instance of Hooks", function () {
            expect(new Hooks()).to.be.a(Hooks);
        });
    });
    describe(".addHook()", function () {
        beforeEach(function () {
            hooks = new Hooks();
        });

        it("should be chainable", function () {
            expect(hooks.addHook("a", function () {})).to.be(hooks);
        });
        it("should throw an error if a name is not specified", function () {
            expect(function () {
                hooks.addHook(undefined, function () {});
            }).to.throwError(expectTypeError);
        });
        it("should throw an error if a hook is not specified", function () {
            expect(function () {
                hooks.addHook("a", undefined);
            }).to.throwError(expectTypeError);
        });
    });
    describe(".runHook()", function () {
        beforeEach(function () {
            hooks = new Hooks();
        });

        it("should be chainable", function () {
            expect(hooks.runHook("a")).to.be(hooks);
        });
        it("should throw an error if a name is not specified", function () {
            expect(function () {
                hooks.runHook(undefined);
            }).to.throwError(expectTypeError);
        });
        it("should run all hooks in the right order", function () {
            var order = "";

            hooks.addHook("a", function a1() {
                order += "a1 ";
            });
            hooks.addHook("a", function a2() {
                order += "a2 ";
            });
            hooks.addHook("a", function a3() {
                order += "a3 ";
            });
            hooks.addHook("b", function b() {
                order += "b ";
            });

            hooks.runHook("a");
            hooks.runHook("b");

            expect(order).to.be("a1 a2 a3 b ");
        });
        it("should run the hook on the specified context", function (done) {
            hooks.addHook("a", function () {
                expect(this).to.be(hooks);
                done();
            });
            hooks.runHook("a");
        });
    });
});