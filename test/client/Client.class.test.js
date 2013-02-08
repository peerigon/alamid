"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    _ = require("underscore"),
    value = require("value"),

    pageJS = require("page"),
    config = require("../../lib/client/config.client.js"),
    Client = rewire("../../lib/client/Client.class.js"),

    PageMock = require("./mocks/PageMock.class.js"),
    PageLoaderMock = require("./mocks/PageLoaderMock.class.js"),
    Default404Page = require("../../lib/client/defaults/Default404Page.class.js");

describe("Client", function () {

    var client,
        pages,
        checkForTypeError;

    before(function () {

        Client.__set__({
            PageLoader: PageLoaderMock
        });

        pages = {};

        checkForTypeError = expectError(TypeError);

        function expectError(Constructor) {
            return function (err) {
                expect(err.constructor).to.be(Constructor);
            };
        }

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

        client = new Client(PageMock);

        pageJS.callbacks = [];  // removes previous routes
    });

    afterEach(function () {
        //Clean appended pages after each test
        jQuery("[data-node='page']").remove();
    });

    describe(".constructor()", function () {

        it("should fail with an TypeError when calling without a Page class", function () {
            expect(function () {
                client = new Client({});
            }).to.throwException(checkForTypeError);
        });

        it("should throw no exception when calling with a page", function () {
            client = new Client(PageMock);
        });
    });

    describe(".start()", function () {

        it("should append MainPage to document's body", function () {
            var mainPageDiv;

            client.start();

            mainPageDiv = jQuery("body").find("[data-node='page']");

            expect(mainPageDiv.length).to.equal(1);
            expect(mainPageDiv[0].toString().search("Div") !== -1).to.be(true);

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
            client.addRoute("*", function () {
                //do nothing
            });

            client.dispatchRoute("/blog/posts");

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

            client.addRoute("blog", function () {
                //do nothing
            });

            client.dispatchRoute("blog");

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

            client
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
                .addRoute(
                "blog/posts",
                function (ctx, next) {
                    called.push("/blog/posts");
                    next();
                },
                function (ctx, next) {
                    called.push("/blog/posts2");
                    next();
                }
            )
                .addRoute("*", function (ctx) {
                    called.push("*2");
                });

            client.dispatchRoute("blog/posts");

            expect(called).to.eql(["*1", "/bl", "/blog/*", "/blog/posts", "/blog/posts2", "*2"]);
        });

        it("should work with a string as handler", function () {
            var pageLoader,
                pageURLs,
                route = "blog/about",
                handler = "blog/about";

            client.addRoute(route, handler);

            client.dispatchRoute(route);

            pageLoader = PageLoaderMock.instance;
            pageURLs = pageLoader.pageURLs;
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });

        it("should pass the params from route", function () {
            var context,
                pageLoader;

            client.addRoute("blog/:author/posts/:postId", function (ctx, next) {
                expect(ctx.params.author).to.be("spook");
                expect(ctx.params.postId).to.be("123");
                next();
            });
            client.addRoute("blog/:author/posts/:postId", "blog/posts");

            client.start();

            client.dispatchRoute("blog/spook/posts/123");

            pageLoader = PageLoaderMock.instance;
            context = pageLoader.context;
            expect(context.params.author).to.be("spook");
            expect(context.params.postId).to.be("123");
        });

        it("should display Default404Page if App is in 'development' mode and no handler for given route was added", function () {

            config.env = "development";

            client.dispatchRoute("404");

            expect(value(client.getMainPage().getSubPage()).typeOf(Default404Page)).to.equal(true);
        });

        it("should be chainable", function () {
            client
                .addRoute("blog/posts/:id", "blog/posts")
                .addRoute("blog/posts/author=:authorId", "blog/posts");
        });

    });

    describe(".getCurrentPages()", function () {

        beforeEach(function () {
            client.start(); // Initializes the MainPage
            pages.main = client.getMainPage();
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should return an array with the main page at the beginning", function () {
            expect(client.getCurrentPages()[0]).to.eql(pages.main);
        });

        it("should return an array with the current page hierarchy", function () {
            expect(client.getCurrentPages()).to.eql([pages.main, pages.home, pages.about]);
        });

    });

    describe(".getParentPage()", function () {

        beforeEach(function () {
            client.start(); // Initializes the MainPage
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should return MainPage as Parent-Page", function () {

            pages.main = client.getMainPage();
            pages.main.setSubPage(pages.home);

            expect(client.getParentPage()).to.equal(pages.main);

        });

        it("should return null for Parent-Page", function () {

            pages.main = client.getMainPage();

            expect(client.getParentPage()).to.equal(null);

        });

    });

    describe(".changePage()", function () {

        beforeEach(function () {
            client.start();
            pages.main = client.getMainPage();
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should emit 'pageChange' if it has finished and pass an Object including .toPageURL and .pageParams", function (done) {

            var toPageUrl = "blog",
                pageParams = {};

            client.on("pageChange", function onPageChange(event) {

                expect(event.toPageURL).to.equal(toPageUrl);
                expect(event.pageParams).to.equal(pageParams);

                //.changePage has finished when blog-Page is the sub-Page of the main-Page
                expect(pages.main.getSubPage()).to.equal(pages.blog);

                done();

            });

            client.changePage(toPageUrl, pageParams);

            PageLoaderMock.instance.callback(null, [pages.blog]);
        });

        it("should be possible to change current page to MainPage with '/' as route", function (done) {

            client.on("pageChange", function onPageChange() {
                //MainPage is always on index 0.
                expect(client.getCurrentPages().length).to.equal(1);
                done();
            });

            client.changePage("/", {});

            PageLoaderMock.instance.callback();
        });

        it("should be possible to change current page to MainPage with '' as route", function (done) {

            client.on("pageChange", function onPageChange() {
                //MainPage is always on index 0.
                expect(client.getCurrentPages().length).to.equal(1);
                done();
            });

            client.changePage("", {});

            PageLoaderMock.instance.callback();
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
            client.on("beforePageChange", function beforeChangePage() {
                emitted.push("client");
            });

            client.changePage("blog", {});

            expect(emitted).to.eql(["client", "about", "home"]);
        });

        it("should pass an Object on 'beforePageChange' including .preventDefault(), .toPageURL and .pageParams", function (done) {

            var toPageURL = "blog/posts",
                pageParams = { "key": "value" };

            client.on("beforePageChange", function beforePageChange(event) {
                expect(event.preventDefault).to.be.a(Function);
                expect(event.toPageURL).to.equal(toPageURL);
                expect(event.pageParams).to.equal(pageParams);
                done();
            });

            client.changePage(toPageURL, pageParams);

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

            client.changePage("/", pageParams);

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
            client.on("beforePageChange", function (e) {
                emitted.push("client");
                if (callsPreventDefault === "client") {
                    e.preventDefault();
                }
            });

            callsPreventDefault = "client";
            client.changePage("blog", {});
            expect(emitted).to.eql(["client"]);

            emitted = [];

            callsPreventDefault = "about";
            client.changePage("blog", {});
            expect(emitted).to.eql(["client", "about"]);

            emitted = [];

            callsPreventDefault = "home";
            client.changePage("blog", {});
            expect(emitted).to.eql(["client", "about", "home"]);
        });

        it("should call cancel() on the previous pageLoader that is still running", function () {
            var pageLoader;

            client.changePage("blog", {});
            pageLoader = PageLoaderMock.instance;
            client.changePage("blog", {});
            expect(pageLoader.cancelled).to.be(true);
        });

        it("should not call cancel() on the previous pageLoader that finished", function () {
            var pageLoader;

            client.changePage("blog", {});
            pageLoader = PageLoaderMock.instance;
            pageLoader.callback(null, [pages.blog]);
            client.changePage("blog", {});
            expect(pageLoader.cancelled).to.be(false);
        });

        it("should append all loaded pages from top to bottom and emit 'pageChange' after that", function () {
            var pageLoader,
                pageChangeCalled = false;

            client.on("pageChange", function () {
                pageChangeCalled = true;
            });
            client.changePage("blog/posts", {});
            pageLoader = PageLoaderMock.instance;
            pageLoader.callback(null, [pages.blog, pages.posts]);
            expect(pages.main.getSubPage()).to.be(pages.blog);
            expect(pages.blog.getSubPage()).to.be(pages.posts);
            expect(pages.posts.getSubPage()).to.be(null);
            expect(pageChangeCalled).to.be(true);
        });
    });

    describe(".getContext()", function () {

        it("should eql page.js's context object", function () {

            var ctx = client.getContext();

            expect(ctx.path).to.equal(location.pathname);
            expect(ctx.title).to.equal(document.title);
        });

    });

    describe("on unload", function() {

        beforeEach(function () {
            client.start(); // Initializes the MainPage
            pages.main = client.getMainPage();
            pages.main.setSubPage(pages.home);
            pages.home.setSubPage(pages.about);
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should emit a page-change event on all currentPages", function(done) {

            var currentPages = client.getCurrentPages(),
                cbCnt = 0;

            function cbCalled() {
                if(++cbCnt === currentPages.length) {
                    done();
                }
            }

            _(currentPages).each(function(currentPage) {
                currentPage.on("beforeLeave", cbCalled);
            });

            jQuery(window).trigger('unload');
        });
    });
});