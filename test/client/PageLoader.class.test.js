"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pageRegistry = require("../../lib/client/registries/pageRegistry.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js"),
    PageLoaderExamplePage = require("./mocks/PageMock.class.js"),
    value = require("value"),
    _ = require("underscore"),
    expectTypeError = expectError(TypeError);

function expectError(Constructor) {
    return function (err) {
        expect(err.constructor).to.be(Constructor);
    };
}

describe("PageLoader", function () {
    var pageLoader;

    describe(".constructor()", function () {

        it("should throw an exception if the passed argument is not an array", function () {
            expect(function () {
                pageLoader = new PageLoader(undefined);
            }).to.throwException(expectTypeError);
        });
        it("should throw an exception if the passed argument is an array without strings", function () {
            expect(function () {
                pageLoader = new PageLoader([]);
            }).to.throwException(expectTypeError);
            expect(function () {
                pageLoader = new PageLoader([2]);
            }).to.throwException(expectTypeError);
        });
        it("should throw an exception if the passed argument is an array with empty strings", function () {
            expect(function () {
                pageLoader = new PageLoader([""]);
            }).to.throwException(expectTypeError);
        });
        it("should throw no exception when passing an array with strings", function () {
            function blogBundle() {}
            function postsBundle() {}

            pageRegistry.setPage("blog", blogBundle);
            pageRegistry.setPage("blog/posts", postsBundle);

            pageLoader = new PageLoader(["blog", "blog/posts"]);
        });

    });

    describe(".load()", function () {

        it("should return the pages in the callback and pass the params to the page", function (done) {
            var blogPage,
                postsPage,
                ctx = { paramA: "A", paramB: "B" };

            function blogBundle(callback) { callback(PageLoaderExamplePage); }
            function postsBundle(callback) {
                setTimeout(function asyncBundleCallback() {
                    callback(PageLoaderExamplePage);
                }, 0); // simulate asynchronous data loading
            }

            pageRegistry.setPage("blog", blogBundle);
            pageRegistry.setPage("blog/posts", postsBundle);

            pageLoader = new PageLoader(["blog", "blog/posts"]);
            pageLoader.load(ctx, function onPagesLoaded(err, pages) {
                expect(err).to.be(null);
                blogPage = pages[0];
                postsPage = pages[1];
                expect(blogPage).to.be.a(PageLoaderExamplePage);
                expect(postsPage).to.be.a(PageLoaderExamplePage);
                expect(blogPage.params === ctx).to.equal(true);
                expect(postsPage.params === ctx).to.equal(true);
                done();
            });
        });

        it("should return a 404 page for every page that can't been found", function () {
            pageLoader = new PageLoader(["does", "not/exist"]);
            pageLoader.load({}, function (err, pages) {
                expect(pages[0]._root.innerHTML).to.contain("404");
                expect(pages[1]._root.innerHTML).to.contain("404");
            });
        });

    });

    describe(".cancel()", function () {

        it("should cancel all callbacks, dispose all loaded pages and do no final callback", function () {
            var disposeCalled = false,
                postsCallback;

            function BlogPage() {
                this.dispose = function () {
                    disposeCalled = true;
                };
            }

            function PostsPage() {
                throw new Error("The page should not be created after the loading has been cancelled");
            }

            pageRegistry.setPage("/blog", function blogBundle(callback) {
                callback(BlogPage);
            });
            pageRegistry.setPage("/blog/posts", function postsBundle(callback) {
                postsCallback = callback;
            });

            pageLoader = new PageLoader(["/blog", "/blog/posts"]);
            pageLoader.load({}, function onPagesLoaded(err, pages) {
                throw new Error("This callback should never be executed");
            });
            pageLoader.cancel();
            expect(disposeCalled).to.be(true);
            // Triggering the deferred callback after the process has been cancelled.
            // PostsPage should not be instantiated
            postsCallback(PostsPage);
        });

    });
});