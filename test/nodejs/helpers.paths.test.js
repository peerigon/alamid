"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    paths = require("../../lib/shared/helpers/paths.js"),
    checkError = require("./testHelpers/checkError.js"),
    filters = paths.filters,
    checkForError = checkError(Error),
    checkForTypeError = checkError(TypeError);

describe("paths", function () {

    describe("#filters", function () {

        describe("##noClasses", function(){
            it("should filter all files expect class files", function () {
                expect(filters.noClasses("fileName.class.js")).to.be(false);
                expect(filters.noClasses("fileName.js")).to.be(true);
                expect(filters.noClasses("fileName.server.class.js")).to.be(false);
            });
        });

        describe("##onlyClasses", function(){
            it("should filter only class files", function () {
                expect(filters.onlyClasses("fileName.class.js")).to.be(true);
                expect(filters.onlyClasses("fileName.js")).to.be(false);
                expect(filters.onlyClasses("fileName.server.class.js")).to.be(true);
            });
        });

        describe("##noAlamidFiles", function(){
            it("should only return files, that don't contain to alamid", function () {
                expect(filters.noAlamidFiles("node_modules/alamid/fileName.js")).to.be(false);
                expect(filters.noAlamidFiles("fileName.js")).to.be(true);
                expect(filters.noAlamidFiles("/alamid/fileName.server.class.js")).to.be(true);
            });
        });

        describe("##noServerFiles", function(){
            it("should return everything except server-files", function () {
                expect(filters.noServerFiles("node_modules/alamid/fileName.server.js")).to.be(false);
                expect(filters.noServerFiles("fileName.js")).to.be(true);
                expect(filters.noServerFiles("/alamid/fileName.client.class.js")).to.be(true);
            });
        });

        describe("##onlyServerFiles", function(){
            it("should return only server-files", function () {
                expect(filters.onlyServerFiles("node_modules/alamid/fileName.server.js")).to.be(true);
                expect(filters.onlyServerFiles("fileName.js")).to.be(false);
                expect(filters.onlyServerFiles("/alamid/fileName.client.class.js")).to.be(false);
            });
        });

        describe("##onlyClientFiles", function(){
            it("should return only client-files", function () {
                expect(filters.onlyClientFiles("node_modules/alamid/fileName.server.js")).to.be(false);
                expect(filters.onlyClientFiles("fileName.js")).to.be(false);
                expect(filters.onlyClientFiles("/alamid/fileName.client.class.js")).to.be(true);
            });
        });

        describe("##noClientFiles", function(){
            it("should return everything except client-files", function () {
                expect(filters.noClientFiles("node_modules/alamid/fileName.server.js")).to.be(true);
                expect(filters.noClientFiles("fileName.js")).to.be(true);
                expect(filters.noClientFiles("/alamid/fileName.client.class.js")).to.be(false);
            });
        });
    });

    describe("#use", function () {
        it("should chain appropriately", function () {
            var chain = paths.use.filters(filterA);

            function filterA() {}
            function modifierA() {}

            expect(chain.filters(filterA)).to.be(chain);
            expect(chain.modifiers(modifierA)).to.be(chain);
        });
        describe("##filter", function () {
            it("should apply all filters", function () {
                var called = [],
                    myFilter;

                function filterA() { called.push("a"); return true; }
                function filterB() { called.push("b"); return true; }
                function filterC() { called.push("c"); return true; }

                myFilter = paths.use.filters(filterA, filterB).filters(filterC);
                expect(called).to.eql([]);
                myFilter();
                expect(called).to.eql(["a", "b", "c"]);
            });
            it("should stop after first filter that returned false", function () {
                var called = [],
                    myFilter;

                function filterA() { called.push("a"); return true; }
                function filterB() { called.push("b"); return false; }
                function filterC() { called.push("c"); return true; }

                myFilter = paths.use.filters(filterA, filterB, filterC);
                myFilter();
                expect(called).to.eql(["a", "b"]);
            });
            it("should call all filters with the path", function () {
                var called = [],
                    myFilter;

                function filterA(path) { called.push(path); return true; }

                myFilter = paths.use.filters(filterA, filterA, filterA);
                myFilter("a/b/c");
                expect(called).to.eql(["a/b/c", "a/b/c", "a/b/c"]);
            });
            it("should throw an exception if we don't pass a function", function () {
                expect(function () {
                    paths.use.filters();
                }).to.throwException(checkForError);    // in this case we expect only an error because nothing has been passed
                expect(function () {
                    paths.use.filters(undefined);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(null);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(true);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(2);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters("hello");
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters([]);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters({});
                }).to.throwException(checkForTypeError);
            });
            it("should throw an exception if a filter doesn't return boolean results", function () {
                function returnsNothing() {}
                function returnsUndefined() { return undefined; }
                function returnsNull() { return null; }
                function returnsNumber() { return 2; }
                function returnsString() { return "hello"; }
                function returnsArray() { return []; }
                function returnsObject() { return {}; }

                expect(function () {
                    paths.use.filters(returnsNothing)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsUndefined)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsNull)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsNumber)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsString)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsArray)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    paths.use.filters(returnsObject)();
                }).to.throwException(checkForTypeError);
            });

            // TODO finish remaining tests
        });
    });
});