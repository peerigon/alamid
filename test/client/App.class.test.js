"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    App = rewire("../../lib/client/App.class.js"),
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
        pages.main = new PageMock();
        pages.main.name = "Main";
        pages.blog = new PageMock();
        pages.blog.name = "Blog";   // for debugging purposes
        pages.posts = new PageMock();
        pages.posts.name = "Posts";
        pages.home = new PageMock();
        pages.home.name = "Home";
        pages.about = new PageMock();
        pages.about.name = "About";
        app = new App(pages.main);
    });
    describe(".init()", function () {
        it("should fail when calling without a page", function () {
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
            app = new App(pages.main);
        });
    });
    describe(".route()", function () {
        it("should work with a string as handler", function () {
            app.route("/blog", "blog");
        });
        it("should work with a function as handler", function () {
            app.route("/blog/about", function (ctx) {
                app.changePage("blog/about", ctx.params);
            });
        });
        it("should work with a regexp-route", function () {
            app.route(/(hello){3}/gi, "blog");
        });
        it("should be chainable", function () {
            app
                .route("/blog/posts/:id", "blog/posts")
                .route("/blog/posts/author=:authorId", "blog/posts");
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
        it("should emit 'beforePageChange' first and than 'leave' on every sub page that will be changed from bottom to top", function () {
            var emitted = [];

            pages.about.on("leave", function () {
                emitted.push("about");
            });
            pages.home.on("leave", function () {
                emitted.push("home");
            });
            pages.main.on("leave", function () {
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

            pages.about.on("leave", function (e) {
                emitted.push("about");
                if (callsPreventDefault === "about") {
                    e.preventDefault();
                }
            });
            pages.home.on("leave", function (e) {
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
    describe(".dispatchRoute()", function () {
        it("should execute the registered route handlers in the given order", function () {
            var called = [];

            app.route("*", function (ctx, params) {
                called.push("*");
            });
            app.route("/blog", function (ctx, params) {
                called.push("/blog");
            });
        });
    });
});



