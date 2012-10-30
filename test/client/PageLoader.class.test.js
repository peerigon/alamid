"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pageRegistry = require("../../lib/client/registries/pageRegistry.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js"),
    PageLoaderExamplePage = require("./mocks/PageMock.class.js"),
    value = require("value"),
    expectTypeError = expectError(TypeError);

function expectError(Constructor) {
    return function (err) {
        expect(err.constructor).to.be(Constructor);
    };
}

describe("PageLoader", function () {
    var instance;

    describe(".init()", function () {
        it("should throw an exception if the passed argument is not an array", function () {
            expect(function () {
                instance = new PageLoader();
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader(null);
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader(true);
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader(1);
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader("bla");
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader({});
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader(function () {});
            }).to.throwException(expectTypeError);
        });
        it("should throw an exception if the passed argument is an array with no strings only", function () {
            expect(function () {
                instance = new PageLoader([]);
            }).to.throwException(expectTypeError);
            expect(function () {
                instance = new PageLoader([2]);
            }).to.throwException(expectTypeError);
        });
        it("should throw an exception if the passed argument is an array with empty strings", function () {
            expect(function () {
                instance = new PageLoader([""]);
            }).to.throwException(expectTypeError);
        });
        it("should throw an exception if the pageURL is unknown to the pageRegistry", function () {
            expect(function () {
                instance = new PageLoader(["not/existent"]);
            }).to.throwException();
        });
        it("should throw no exception when passing an array with strings", function () {
            function blogBundle() {}
            function postsBundle() {}

            pageRegistry.setPage("blog", blogBundle);
            pageRegistry.setPage("blog/posts", postsBundle);

            instance = new PageLoader(["blog", "blog/posts"]);
        });
    });
    describe(".load()", function () {
        it("should return the pages in the callback and pass the params to the page", function (done) {
            var blogPage,
                postsPage,
                params = { paramA: "A", paramB: "B" };

            function blogBundle(callback) { callback(PageLoaderExamplePage); }
            function postsBundle(callback) {
                setTimeout(function asyncBundleCallback() {
                    callback(PageLoaderExamplePage);
                }, 0); // simulate asynchronous data loading
            }

            pageRegistry.setPage("blog", blogBundle);
            pageRegistry.setPage("blog/posts", postsBundle);

            instance = new PageLoader(["blog", "blog/posts"]);
            instance.load(params, function onPagesLoaded(err, pages) {
                expect(err).to.be(null);
                blogPage = pages[0];
                postsPage = pages[1];
                expect(blogPage).to.be.a(PageLoaderExamplePage);
                expect(postsPage).to.be.a(PageLoaderExamplePage);
                expect(blogPage.getParams()).to.be(params);
                expect(postsPage.getParams()).to.be(params);
                expect(blogPage.getEmitted()).to.be.eql([]);
                expect(postsPage.getEmitted()).to.be.eql([]);
                done();
            });
        });
        it("should emit a data event on every page when using dataLoaders", function (done) {
            var blogPage,
                blogData = {},
                postsPage,
                postsData = {},
                params = { paramA: "A", paramB: "B" };

            function blogBundle(callback) { callback(PageLoaderExamplePage); }
            function postsBundle(callback) {
                setTimeout(function asyncBundleCallback() {
                    callback(PageLoaderExamplePage);
                }, 0); // simulate asynchronous data loading
            }

            function blogDataLoader(params, callback) {
                expect(params).to.be(params);
                callback(null, blogData);
            }

            function postsDataLoader(params, callback) {
                expect(params).to.be(params);
                setTimeout(function asyncDataLoaderCallback() {
                    callback(null, postsData);
                }, 0);  // simulate asynchronous data loading
            }

            pageRegistry.setPage("blog", blogBundle, blogDataLoader);
            pageRegistry.setPage("blog/posts", postsBundle, postsDataLoader);

            instance = new PageLoader(["blog", "blog/posts"]);
            instance.load(params, function onPagesLoaded(err, pages) {
                expect(err).to.be(null);
                blogPage = pages[0];
                postsPage = pages[1];
                expect(blogPage).to.be.a(PageLoaderExamplePage);
                expect(postsPage).to.be.a(PageLoaderExamplePage);
                expect(blogPage.getParams()).to.be(params);
                expect(postsPage.getParams()).to.be(params);
                expect(blogPage.getEmitted()).to.have.length(1);
                expect(postsPage.getEmitted()).to.have.length(1);
                expect(blogPage.getEmitted()[0]).to.eql(["data", blogData]);
                expect(postsPage.getEmitted()[0]).to.eql(["data", postsData]);
                done();
            });
        });
        it("should emit a data error event when the dataLoader passes an error", function (done) {
            var blogPage,
                blogError = {},
                postsPage,
                postsError = {},
                params = { paramA: "A", paramB: "B" };

            function blogBundle(callback) { callback(PageLoaderExamplePage); }
            function postsBundle(callback) {
                setTimeout(function asyncBundleCallback() {
                    callback(PageLoaderExamplePage);
                }, 0); // simulate asynchronous data loading
            }

            function blogDataLoader(params, callback) {
                callback(blogError);
            }

            function postsDataLoader(params, callback) {
                setTimeout(function asyncDataLoaderCallback() {
                    callback(postsError);
                }, 0);  // simulate asynchronous data loading
            }

            pageRegistry.setPage("blog", blogBundle, blogDataLoader);
            pageRegistry.setPage("blog/posts", postsBundle, postsDataLoader);

            instance = new PageLoader(["blog", "blog/posts"]);
            instance.load(params, function onPagesLoaded(err, pages) {
                expect(err).to.be(null); // err should be null because this error is not related
                                         // to dataLoader errors of pages
                blogPage = pages[0];
                postsPage = pages[1];
                expect(blogPage.getEmitted()[0]).to.eql(["dataError", blogError]);
                expect(postsPage.getEmitted()[0]).to.eql(["dataError", postsError]);
                done();
            });
        });
        it("should throw an exception when load() is called twice", function (done) {
            instance = new PageLoader(["blog", "blog/posts"]);
            instance.load({}, function onPagesLoaded(err, pages) { done(); });
            expect(function () {
                instance.load({}, function onPagesLoaded(err, pages) { throw new Error("This callback should not be executed"); });
            }).to.throwException();
        });
    });
    describe(".cancel()", function () {
        it("should cancel all callbacks, dispose all loaded pages and do no final callback", function () {
            var disposeCalled = false;

            function PageA() {
                this.dispose = function () {
                    disposeCalled = true;
                };
            }
            function blogBundle(callback) { callback(PageA); }

            function blogDataLoader(params, callback) {
                setTimeout(function asyncDataLoaderCallback() {
                    callback(PageLoaderExamplePage);
                }, 0); // simulate asynchronous data loading
            }

            pageRegistry.setPage("blog", blogBundle, blogDataLoader);

            instance = new PageLoader(["blog"]);
            instance.load({}, function onPagesLoaded(err, pages) {
                throw new Error("This callback should never be executed");
            });
            instance.cancel();
            expect(disposeCalled).to.be(true);
        });
    });
});