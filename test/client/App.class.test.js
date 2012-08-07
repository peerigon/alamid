"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    App = rewire("../../lib/client/App.class.js"),
    pageJS = require("page"),
    Page = require("../../lib/client/Page.class.js"),
    PageMock = require("./mocks/PageMock.class.js"),
    PageLoaderMock = require("./mocks/PageLoaderMock.class.js"),
    _ = require("underscore");

var checkForTypeError = expectError(TypeError),
    pages = {};

function expectError(Constructor) {
    return function (err) {
        expect(err.constructor).to.be(Constructor);
    };
}

describe("App", function () {
    var app;

    before(function () {
        PageMock.Extends = Page;    // tricks the instanceof check in App.init()
        App.__set__({
            PageLoader: PageLoaderMock
        });
    });
    beforeEach(function () {
        pages.blog = new PageMock();
        pages.blog.name = "Blog";   // for debugging purposes
        pages.posts = new PageMock();
        pages.posts.name = "Posts";
        pages.home = new PageMock();
        pages.home.name = "Home";
        pages.about = new PageMock();
        pages.about.name = "About";
        app = new App(PageMock);
        app.start();
        pages.main = app.getMainPage();
        pages.main.name = "Main";
        pageJS.callbacks = [];  // removes previous routes
    });
    describe(".init()", function () {
        it("should fail when calling without a page class", function () {
            expect(function () {
                app = new App();
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App(null);
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App(true);
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App(2);
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App("hello");
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App([]);
            }).to.throwException(checkForTypeError);
            expect(function () {
                app = new App({});
            }).to.throwException(checkForTypeError);
        });
        it("should throw no exception when calling with a page", function () {
            app = new App(PageMock);
        });
    });
    describe(".addRoute() / .dispatchRoute()", function () {
        var state;

        before(function () {
            state = window.location.pathname + window.location.search;
        });
        after(function () {
            history.pushState(null, null, state);
        });
        it("should modify the history state", function () {
            app.addRoute("*", function () {
                // This route handler is needed so pageJS doesn't change the window.location
            });
            app.dispatchRoute("/blog/posts");
            expect(window.location.pathname).to.be("/blog/posts");
        });
        it("should execute the registered route handlers in the given order", function () {
            var called = [];

            app.addRoute("*", function (ctx, next) {
                called.push("*1");
                next();
            });
            app.addRoute(/^\/bl/i, function (ctx, next) {
                called.push("/bl");
                next();
            });
            app.addRoute("/blog", function (ctx, next) {
                throw new Error("This handler should not be triggered");
            });
            app.addRoute("/blog/*", function (ctx, next) {
                called.push("/blog/*");
                next();
            });
            app.addRoute("/blog/posts", function (ctx, next) {
                called.push("/blog/posts");
                next();
            });
            app.addRoute("*", function (ctx) {
                called.push("*2");
            });

            app.dispatchRoute("/blog/posts");

            expect(called).to.eql(["*1", "/bl", "/blog/*", "/blog/posts", "*2"]);
        });
        it("should work with a string as handler", function () {
            var pageLoader,
                pageURLs;

            app.addRoute("/blog/about", "blog/about");
            app.dispatchRoute("/blog/about");
            pageLoader = PageLoaderMock.instance;
            pageURLs = pageLoader.getPageURLs();
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });
        it("should pass the params", function () {
            var params,
                pageLoader;

            app.addRoute("/blog/:author/posts/:postId", function (ctx, next) {
                expect(ctx.params.author).to.be("spook");
                expect(ctx.params.postId).to.be("123");
                next();
            });
            app.addRoute("/blog/:author/posts/:postId", "blog/posts");
            app.dispatchRoute("/blog/spook/posts/123");

            pageLoader = PageLoaderMock.instance;
            params = pageLoader.getParams();
            expect(params.author).to.be("spook");
            expect(params.postId).to.be("123");
        });
        it("should be chainable", function () {
            app
                .addRoute("/blog/posts/:id", "blog/posts")
                .addRoute("/blog/posts/author=:authorId", "blog/posts");
        });
    });
    describe(".getCurrentPages()", function () {
        it("should return an array with the main page at the beginning", function () {
            expect(app.getCurrentPages()).to.eql([pages.main]);
        });
        it("should return an array with the current page hierarchy", function () {
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
            expect(app.getCurrentPages()).to.eql([pages.main, pages.home, pages.about]);
        });
    });
    describe(".changePage()", function () {
        beforeEach(function () {
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });
        it("should emit 'beforePageChange' first and than 'beforeLeave' on every sub page that will be changed from bottom to top", function () {
            var emitted = [];

            pages.about.on("beforeLeave", function () {
                emitted.push("about");
            });
            pages.home.on("beforeLeave", function () {
                emitted.push("home");
            });
            pages.main.on("beforeLeave", function () {
                throw new Error("This event should never be emitted because the main page can be left");
            });
            app.on("beforePageChange", function () {
                emitted.push("app");
            });

            app.changePage("blog", {});

            expect(emitted).to.eql(["app", "about", "home"]);
        });
        it("should immediately cancel the process when calling event.preventDefault()", function () {
            var emitted = [],
                callsPreventDefault;

            pages.about.on("beforeLeave", function (e) {
                emitted.push("about");
                if (callsPreventDefault === "about") {
                    e.preventDefault();
                }
            });
            pages.home.on("beforeLeave", function (e) {
                emitted.push("home");
                if (callsPreventDefault === "home") {
                    e.preventDefault();
                }
            });
            app.on("beforePageChange", function (e) {
                emitted.push("app");
                if (callsPreventDefault === "app") {
                    e.preventDefault();
                }
            });

            callsPreventDefault = "app";
            app.changePage("blog", {});
            expect(emitted).to.eql(["app"]);

            emitted = [];

            callsPreventDefault = "about";
            app.changePage("blog", {});
            expect(emitted).to.eql(["app", "about"]);

            emitted = [];

            callsPreventDefault = "home";
            app.changePage("blog", {});
            expect(emitted).to.eql(["app", "about", "home"]);
        });
        it("should call cancel() on the previous pageLoader that is still running", function () {
            var pageLoader;

            app.changePage("blog", {});
            pageLoader = PageLoaderMock.instance;
            app.changePage("blog", {});
            expect(pageLoader.getCancelled()).to.be(true);
        });
        it("should not call cancel() on the previous pageLoader that finished", function () {
            var pageLoader;

            app.changePage("blog", {});
            pageLoader = PageLoaderMock.instance;
            pageLoader.getCallback()(null, [pages.blog]);
            app.changePage("blog", {});
            expect(pageLoader.getCancelled()).to.be(false);
        });
        it("should append all loaded pages from top to bottom and emit 'pageChange' after that", function () {
            var emitted = [],
                pageLoader;

            pages.main.on("append", function () {
                throw new Error("The main page doesn't get re-appended");
            });
            pages.blog.on("append", function () {
                emitted.push("blog");
            });
            pages.posts.on("append", function () {
                emitted.push("posts");
            });
            app.on("pageChange", function () {
                emitted.push("app");
            });
            app.changePage("blog/posts", {});
            pageLoader = PageLoaderMock.instance;
            pageLoader.getCallback()(null, [pages.blog, pages.posts]);
            expect(pages.main.getSubPage()).to.be(pages.blog);
            expect(pages.blog.getSubPage()).to.be(pages.posts);
            expect(pages.posts.getSubPage()).to.be(null);
            expect(emitted).to.eql(["blog", "posts", "app"]);
        });
    });
});



