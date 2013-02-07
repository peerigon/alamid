"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Plugins = require("../../lib/shared/Plugins.mixin.js"),
    checkError = require("../testHelpers/checkError.js");

var expectTypeError = checkError(TypeError);

describe("Plugins", function () {
    var plugins;

    describe("constructor", function () {
        it("should create an instance of Plugins", function () {
            expect(new Plugins()).to.be.a(Plugins);
        });
    });
    describe(".hook()", function () {
        beforeEach(function () {
            plugins = new Plugins();
        });

        it("should be chainable", function () {
            expect(plugins.hook("a", function () {})).to.be(plugins);
        });
        it("should throw an error if a name is not specified", function () {
            expect(function () {
                plugins.hook(undefined, function () {});
            }).to.throwError(expectTypeError);
        });
        it("should throw an error if a hook is not specified", function () {
            expect(function () {
                plugins.hook("a", undefined);
            }).to.throwError(expectTypeError);
        });
    });
    describe(".runHook()", function () {
        beforeEach(function () {
            plugins = new Plugins();
        });

        it("should be chainable", function () {
            expect(plugins.runHook("a")).to.be(plugins);
        });
        it("should throw an error if a name is not specified", function () {
            expect(function () {
                plugins.runHook(undefined);
            }).to.throwError(expectTypeError);
        });
        it("should run all plugins in the right order", function () {
            var order = "";

            plugins.hook("a", function a1() {
                order += "a1 ";
            });
            plugins.hook("a", function a2() {
                order += "a2 ";
            });
            plugins.hook("a", function a3() {
                order += "a3 ";
            });
            plugins.hook("b", function b() {
                order += "b ";
            });

            plugins.runHook("a");
            plugins.runHook("b");

            expect(order).to.be("a1 a2 a3 b ");
        });
        it("should run the hook on the specified context", function (done) {
            plugins.hook("a", function () {
                expect(this).to.be(plugins);
                done();
            });
            plugins.runHook("a");
        });
    });
    describe(".plugin()", function () {
        beforeEach(function () {
            plugins = new Plugins();
        });
        it("should run all hooks provided by the plugins", function () {
            var order = "",
                myPlugin1 = {
                    a: function () { order += "1a "; },
                    b: function () { order += "1b "; },
                    c: function () { order += "1c "; }
                },
                myPlugin2 = {
                    a: function () { order += "2a "; }
                };

            plugins.plugin(myPlugin1);
            plugins.plugin(myPlugin2);
            plugins.runHook("a");
            plugins.runHook("b");
            expect(order).to.be("1a 2a 1b ");
        });
        it("should run plugin-hooks in the plugin context", function (done) {
            var myPlugin = {
                    a: function () {
                        expect(this).to.be(myPlugin);
                        done();
                    }
                };

            plugins.plugin(myPlugin);
            plugins.runHook("a");
        });
        it("should be chainable", function () {
            expect(plugins.plugin({})).to.be(plugins);
        });
        it("should throw a TypeError if the plugin is not typeof object", function () {
            expect(function () {
                plugins.plugin("I'm not a plugin");
            }).to.throwError(expectTypeError);
        });
    });
});