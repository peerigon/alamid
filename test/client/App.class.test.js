"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    _ = require("underscore"),
    is = require("nodeclass").is,

    pageJS = require("page"),
    config = require("../../lib/client/config.client.js"),
    App = rewire("../../lib/client/App.class.js"),

    PageMock = require("./mocks/PageMock.class.js"),
    PageLoaderMock = require("./mocks/PageLoaderMock.class.js"),
    Default404Page = require("../../lib/client/defaults/Default404Page.class.js");

describe("App", function () {

    var app,
        pages,
        checkForTypeError,
        $dataNodePageDiv;

    before(function () {

        App.__set__({
            PageLoader: PageLoaderMock
        });

        pages = {};

        checkForTypeError = expectError(TypeError);

        function expectError(Constructor) {
            return function (err) {
                expect(err.constructor).to.be(Constructor);
            };
        }

        //Fakes the index.html that is required to call App.start.
        jQuery("body").append("<div data-node='page' style='display:none;'></div>");
        $dataNodePageDiv = jQuery("body").find("[data-node=page]").last();

    });

    after(function () {
        //Clean index.html fake.
        $dataNodePageDiv.remove();
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

        pageJS.callbacks = [];  // removes previous routes
    });

    describe(".init()", function () {

        it("should fail with an TypeError when calling without a Page class", function () {
            expect(function () {
                app = new App({});
            }).to.throwException(checkForTypeError);
        });

        it("should throw no exception when calling with a page", function () {
            app = new App(PageMock);
        });

    });

    describe(".dispatchRoute()", function () {

        var url;

        before(function () {
            url = window.location.pathname + window.location.search;
        });

        after(function () {
            history.replaceState(null, null, url);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should modify the history state", function () {
            // This route handler is needed so pageJS doesn't change the window.location
            app.addRoute("*", function () {
                //do nothing
            });

            app.dispatchRoute("/blog/posts");

            expect(window.location.pathname).to.be("/blog/posts");
        });

        it("should call automatically .start() with {dispatch: false} if it was not called manually", function () {

            var isStartCalled = false,
                startParams,
            //pageJS muss be saved, cause it behaves like a singleton
                pageJSStart = pageJS.start;

            //Apply monkey patch to .start()
            pageJS.start = function (params) {
                isStartCalled = true;
                startParams = params;
            };

            app.addRoute("blog", function () {
                //do nothing
            });

            app.dispatchRoute("blog");

            expect(isStartCalled).to.be(true);
            expect(startParams.dispatch).to.be(false);

            //Revert monkey patch .start()
            pageJS.start = pageJSStart;
        });

    });

    describe(".addRoute()", function () {

        var url,
            historyPushState,
            historyPushStateMonkeyPatch = function () {
                // do nothing
            },
            historyReplaceState,
            historyReplaceStateMock = function () {
                // do nothing
            };

        before(function () {
            url = window.location.pathname + window.location.search;

            //backup
            historyPushState = history.pushState;
            historyReplaceState = history.replaceState;

            //apply monkey patches to prevent modifications of history's state
            history.pushState = historyPushStateMonkeyPatch;
            history.replaceState = historyReplaceStateMock;
        });

        after(function () {
            //undo monkey patches
            history.pushState = historyPushState;
            history.replaceState = historyReplaceState;
            history.replaceState(null, null, url);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should execute the added route handlers in the given order", function () {
            var called = [];

            app
                .addRoute("*", function (ctx, next) {
                    called.push("*1");
                    next();
                })
                .addRoute(/^bl/i, function (ctx, next) {
                    called.push("/bl");
                    next();
                })
                .addRoute("blog", function (ctx, next) {
                    throw new Error("This handler should not be triggered");
                })
                .addRoute("blog/*", function (ctx, next) {
                    called.push("/blog/*");
                    next();
                })
                .addRoute("blog/posts", function (ctx, next) {
                    called.push("/blog/posts");
                    next();
                })
                .addRoute("*", function (ctx) {
                    called.push("*2");
                });

            app.dispatchRoute("blog/posts");

            expect(called).to.eql(["*1", "/bl", "/blog/*", "/blog/posts", "*2"]);
        });

        it("should work with a string as handler", function () {
            var pageLoader,
                pageURLs,
                route = "blog/about",
                handler = "blog/about";

            app.addRoute(route, handler);

            app.dispatchRoute(route);

            pageLoader = PageLoaderMock.instance;
            pageURLs = pageLoader.getPageURLs();
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });

        it("should pass the params from route", function () {
            var params,
                pageLoader;

            app.addRoute("blog/:author/posts/:postId", function (ctx, next) {
                expect(ctx.params.author).to.be("spook");
                expect(ctx.params.postId).to.be("123");
                next();
            });
            app.addRoute("blog/:author/posts/:postId", "blog/posts");

            app.start();

            app.dispatchRoute("blog/spook/posts/123");

            pageLoader = PageLoaderMock.instance;
            params = pageLoader.getParams();
            expect(params.author).to.be("spook");
            expect(params.postId).to.be("123");
        });

        it("should display Default404Page if App is in 'development' mode and no handler for given route was added", function () {
            config.mode = "development";

            app.dispatchRoute("404");

            expect(is(app.getMainPage().getSubPage()).instanceOf(Default404Page)).to.equal(true);
        });

        it("should be chainable", function () {
            app
                .addRoute("blog/posts/:id", "blog/posts")
                .addRoute("blog/posts/author=:authorId", "blog/posts");
        });
    });

    describe(".getCurrentPages()", function () {

        beforeEach(function () {
            app.start();
            pages.main = app.getMainPage();
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should return an array with the main page at the beginning", function () {
            expect(app.getCurrentPages()[0]).to.eql(pages.main);
        });

        it("should return an array with the current page hierarchy", function () {
            expect(app.getCurrentPages()).to.eql([pages.main, pages.home, pages.about]);
        });

    });

    describe(".changePage()", function () {

        beforeEach(function () {
            app.start();
            pages.main = app.getMainPage();
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should emit 'pageChange' if it has finished and pass an Object including .toPageURL and .pageParams", function (done) {

            var toPageUrl = "blog",
                pageParams = {};

            app.on("pageChange", function onPageChange(event) {

                expect(event.toPageURL).to.equal(toPageUrl);
                expect(event.pageParams).to.equal(pageParams);

                //.changePage has finished when blog-Page is the sub-Page of the main-Page
                expect(pages.main.getSubPage()).to.equal(pages.blog);

                done();

            });

            app.changePage(toPageUrl, pageParams);

            PageLoaderMock.instance.getCallback()(null, [pages.blog]);
        });

        it("should be possible to change current page to MainPage with '/' as route", function (done) {

            app.on("pageChange", function onPageChange() {
                //MainPage is always on index 0.
                expect(app.getCurrentPages().length).to.equal(1);
                done();
            });

            app.changePage("/", {});

            PageLoaderMock.instance.getCallback()();
        });

        it("should be possible to change current page to MainPage with '' as route", function (done) {

            app.on("pageChange", function onPageChange() {
                //MainPage is always on index 0.
                expect(app.getCurrentPages().length).to.equal(1);
                done();
            });

            app.changePage("", {});

            PageLoaderMock.instance.getCallback()();
        });

        it("should emit 'beforePageChange' first and than 'beforeLeave' on every Sub-Ppage that will be changed from bottom to top", function () {
            var emitted = [];

            pages.about.on("beforeLeave", function beforeLeaveAbout() {
                emitted.push("about");
            });
            pages.home.on("beforeLeave", function beforeLeaveHome() {
                emitted.push("home");
            });
            pages.main.on("beforeLeave", function beforeLeaveMain() {
                throw new Error("This event should never be emitted because the main page can't be left");
            });
            app.on("beforePageChange", function beforeChangePage() {
                emitted.push("app");
            });

            app.changePage("blog", {});

            expect(emitted).to.eql(["app", "about", "home"]);
        });

        it("should pass an Object on 'beforePageChange' including .preventDefault(), .toPageURL and .pageParams", function (done) {

            var toPageURL = "blog/posts",
                pageParams = { "key": "value" };

            app.on("beforePageChange", function beforePageChange(event) {
                expect(event.preventDefault).to.be.a(Function);
                expect(event.toPageURL).to.equal(toPageURL);
                expect(event.pageParams).to.equal(pageParams);
                done();
            });

            app.changePage(toPageURL, pageParams);

        });

        it("should pass an Object on 'beforeLeave' including .preventDefault(), .toPageURL and .pageParams for each Page that will be leaved", function () {

            var pageParams = { "key": "value" };

            pages.about.on("beforeLeave", function beforeLeaveAbout(event) {
                expect(event.preventDefault).to.be.a(Function);
                expect(event.toPageURL).to.equal("/");
                expect(event.pageParams).to.equal(pageParams);
            });

            pages.home.on("beforeLeave", function beforeLeaveAbout(event) {
                expect(event.preventDefault).to.be.a(Function);
                expect(event.toPageURL).to.equal("/");
                expect(event.pageParams).to.equal(pageParams);
            });

            app.changePage("/", pageParams);

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

            pages.main.on("add", function () {
                throw new Error("The main page doesn't get re-appended");
            });
            pages.blog.on("add", function () {
                emitted.push("blog");
            });
            pages.posts.on("add", function () {
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