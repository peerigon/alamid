"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js"),
    Page = require("../../lib/client/Page.class.js"),
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

    describe(".bundles", function () {
        it("should be an object", function () {
            expect(PageLoader.bundles).to.be.an(Object);
        });
    });

    describe(".loadedPages", function () {
        it("should be an object", function () {
            expect(PageLoader.loadedPages).to.be.an(Object);
        });
    });

    describe("#constructor()", function () {

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
        it("should throw no exception when passing an array with strings", function () {
            function blogBundle() {}
            function postsBundle() {}

            PageLoader.bundles["/blog"] = blogBundle;
            PageLoader.bundles["/blog/posts"] = postsBundle;

            pageLoader = new PageLoader(["blog", "blog/posts"]);
        });

    });

    describe("#load()", function () {
        var ctx = { paramA: "A", paramB: "B" },
            template = "<h1>Just a template</h1>";

        function blogBundle(callback) { callback(Page); }
        function postsBundle(callback) {
            setTimeout(function asyncBundleCallback() {
                callback(template);
            }, 0); // simulate asynchronous data loading
        }

        before(function () {
            PageLoader.bundles["/blog"] = blogBundle;
            PageLoader.bundles["/blog/posts"] = postsBundle;
        });

        it("should return the pages in the callback and pass the params to the page", function (done) {
            var blogPage,
                postsPage;

            pageLoader = new PageLoader(["/blog", "/blog/posts"]);
            pageLoader.load(ctx, function onPagesLoaded(err, pages) {
                expect(err).to.be(null);
                blogPage = pages[0];
                postsPage = pages[1];
                expect(blogPage).to.be.a(Page);
                expect(postsPage).to.be.a(Page);
                expect(blogPage.context).to.be(ctx);
                expect(postsPage.context).to.be(ctx);
                expect(postsPage.template).to.be(template);
                done();
            });
        });

        it("should add the loaded pages to .loadedPages", function () {
            expect(PageLoader.loadedPages["/blog"]).to.be.a(Function);
            expect(PageLoader.loadedPages["/blog/posts"]).to.be.a(Function);
        });

        it("should return a 404 page for every page that can't been found", function () {
            pageLoader = new PageLoader(["/does", "/not/exist"]);
            pageLoader.load({}, function (err, pages) {
                expect(pages[0]._root.innerHTML).to.contain("404");
                expect(pages[0]._root.innerHTML).to.contain("/does");
                expect(pages[1]._root.innerHTML).to.contain("404");
                expect(pages[1]._root.innerHTML).to.contain("/not/exist");
            });
        });

    });

    describe("#cancel()", function () {

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

            PageLoader.bundles["/blog"] = function blogBundle(callback) {
                callback(BlogPage);
            };
            PageLoader.bundles["/blog/posts"] = function postsBundle(callback) {
                postsCallback = callback;
            };

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