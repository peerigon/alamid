"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pageRegistry = require("../../../lib/client/registries/pageRegistry.js");

/*
describe("pageRegistry", function () {
    function bundleA(callback) { callback("A"); }
    function bundleB(callback) { callback("B"); }
    function bundleAsync(callback) {
        setTimeout(function () {
            callback("Async");
        }, 0);
    }
    function dataLoaderA() {}

    describe(".setPage()", function () {
        it("should throw no error", function () {
            pageRegistry.setPage("my/page/A", bundleA, dataLoaderA);
            pageRegistry.setPage("my/page/B", bundleB);
            pageRegistry.setPage("my/page/Async", bundleAsync);
        });
        it("should overwrite the first entry when called with the same pageURL", function () {
            pageRegistry.setPage("my/page/A", bundleA);
            expect(pageRegistry.getPageDataLoader("my/page/A")).to.be(null);
        });
    });
    describe(".getPageBundle()", function () {
        it("should return a method that acts like the sync bundle", function (done) {
            var wrappedBundle = pageRegistry.getPageBundle("my/page/A");

            wrappedBundle(function callback(bundleName) {
                expect(bundleName).to.be("A");
                done();
            });
        });
        it("should return a method that acts like the async bundle", function (done) {
            var wrappedBundle = pageRegistry.getPageBundle("my/page/Async");

            wrappedBundle(function callback(bundleName) {
                expect(bundleName).to.be("Async");
                done();
            });
        });
        it("should return undefined if the pageURL is unknown", function () {
            expect(pageRegistry.getPageBundle("my/page/C")).to.be(undefined);
        });
    });
    describe(".getPageDataLoader()", function () {
        it("should return the data loader", function () {
            pageRegistry.setPage("my/page/A", bundleA, dataLoaderA);
            expect(pageRegistry.getPageDataLoader("my/page/A")).to.be(dataLoaderA);
        });
        it("should return null if the page has no dataLoader", function () {
            expect(pageRegistry.getPageDataLoader("my/page/B")).to.be(null);
        });
        it("should return undefined if the pageURL is unknown", function () {
            expect(pageRegistry.getPageDataLoader("my/page/C")).to.be(undefined);
        });
    });
    describe(".getPageClass()", function () {
        it("should return null if the bundle hasn't been executed before", function () {
            expect(pageRegistry.getPageClass("my/page/B")).to.be(null);
        });
        it("should return the page class if the bundle has been executed", function () {
            var bundle = pageRegistry.getPageBundle("my/page/B");

            bundle(function () {});
            expect(pageRegistry.getPageClass("my/page/B")).to.be("B");
        });
        it("should return undefined if the pageURL is unknown", function () {
            expect(pageRegistry.getPageClass("my/page/C")).to.be(undefined);
        });
    });
}); */