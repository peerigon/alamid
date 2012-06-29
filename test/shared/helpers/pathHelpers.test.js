"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pathHelpers = require("../../../lib/shared/helpers/pathHelpers.js"),
    checkError = require("../../testHelpers/checkError.js"),
    filters = pathHelpers.filters,
    checkForError = checkError(Error),
    checkForTypeError = checkError(TypeError);


describe("pathHelpers", function () {

    describe("#filters", function () {

        describe("##noClassFiles", function(){
            it("should filter all files expect class files", function () {
                expect(filters.noClassFiles("fileName.class.js")).to.be(false);
                expect(filters.noClassFiles("fileName.js")).to.be(true);
                expect(filters.noClassFiles("fileName.server.class.js")).to.be(false);
            });
        });

        describe("##onlyClassFiles", function(){
            it("should filter only class files", function () {
                expect(filters.onlyClassFiles("fileName.class.js")).to.be(true);
                expect(filters.onlyClassFiles("fileName.js")).to.be(false);
                expect(filters.onlyClassFiles("fileName.server.class.js")).to.be(true);
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

    describe("#chain", function () {
        it("should chain appropriately", function () {
            var chain = pathHelpers.chain.filter(filterA);

            function filterA() {}
            function modifierA() {}

            expect(chain.filter(filterA)).to.be(chain);
            expect(chain.modifier(modifierA)).to.be(chain);
            chain = pathHelpers.chain.modifier(modifierA);
            expect(chain.filter(filterA)).to.be(chain);
            expect(chain.modifier(modifierA)).to.be(chain);
        });
        describe("##filter", function () {
            it("should apply all filters", function () {
                var myFilter = pathHelpers.chain.filter("noClassFiles", "noAlamidFiles").filter("noServiceURL");

                expect(myFilter("MyClass.class.js")).to.eql(false);
                expect(myFilter("node_modules/alamid/someModule.js")).to.eql(false);
                expect(myFilter("services/BlogService")).to.eql(false);
            });
            it("should apply all arbitrary filters", function () {
                var called = [],
                    myFilter;

                function filterA() { called.push("a"); return true; }
                function filterB() { called.push("b"); return true; }
                function filterC() { called.push("c"); return true; }

                myFilter = pathHelpers.chain.filter(filterA, filterB).filter(filterC);
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

                myFilter = pathHelpers.chain.filter(filterA, filterB, filterC);
                myFilter();
                expect(called).to.eql(["a", "b"]);
            });
            it("should call all filters with the path", function () {
                var called = [],
                    myFilter;

                function filterA(path) { called.push(path); return true; }

                myFilter = pathHelpers.chain.filter(filterA, filterA, filterA);
                myFilter("a/b/c");
                expect(called).to.eql(["a/b/c", "a/b/c", "a/b/c"]);
            });
            it("should throw an exception if we don't pass a function", function () {
                expect(function () {
                    pathHelpers.chain.filter();
                }).to.throwException(checkForError);    // in this case we expect only an error because nothing has been passed
                expect(function () {
                    pathHelpers.chain.filter(undefined);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(null);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(true);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(2);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter([]);
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter({});
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
                    pathHelpers.chain.filter(returnsNothing)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsUndefined)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsNull)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsNumber)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsString)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsArray)();
                }).to.throwException(checkForTypeError);
                expect(function () {
                    pathHelpers.chain.filter(returnsObject)();
                }).to.throwException(checkForTypeError);
            });

            // TODO finish remaining tests
        });
    });
});