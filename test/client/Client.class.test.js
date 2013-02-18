"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    _ = require("underscore"),
    value = require("value"),
    jQuery = require("../../lib/client/helpers/jQuery.js"),

    pageJS = require("page"),
    config = require("../../lib/client/config.client.js"),
    Client = rewire("../../lib/client/Client.class.js"),

    PageMock = require("./mocks/PageMock.class.js"),
    PageLoaderMock = require("./mocks/PageLoaderMock.class.js");

describe("Client", function () {

    var client,
        pages,
        checkForTypeError;

    return;

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
            pageURLs,
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
                .addRoute("blog/posts", function (ctx, next) {
                    called.push("/blog/posts");
                    next();
                }, function (ctx, next) {
                    called.push("/blog/posts2");
                    next();
                })
                .addRoute("*", function (ctx) {
                    called.push("*2");
                });

            client.dispatchRoute("blog/posts");

            expect(called).to.eql(["*1", "/bl", "/blog/*", "/blog/posts", "/blog/posts2", "*2"]);
        });

        it("should work with a string as handler", function () {
            client.addRoute("blog/about", "blog/about");
            client.dispatchRoute("blog/about");

            pageURLs = PageLoaderMock.instance.pageURLs;
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });

        it("should take the route as pageURL when passing only on argument", function () {
            client.addRoute("blog/about");
            client.dispatchRoute("blog/about");

            pageURLs = PageLoaderMock.instance.pageURLs;
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });

        it("should also accept only one string and add it as route and pageURL", function () {
            client.addRoute("blog/about");
            pageURLs = PageLoaderMock.instance.pageURLs;
            expect(pageURLs).to.eql(["blog", "blog/about"]);
        });

        it("should pass the params from route", function () {
            var context;

            client.addRoute("blog/:author/posts/:postId", function (ctx, next) {
                expect(ctx.params.author).to.be("spook");
                expect(ctx.params.postId).to.be("123");
                next();
            });
            client.addRoute("blog/:author/posts/:postId", "blog/posts");
            client.start();
            client.dispatchRoute("blog/spook/posts/123");

            context = PageLoaderMock.instance.context;
            expect(context.params.author).to.be("spook");
            expect(context.params.postId).to.be("123");
        });

        it("should display a 404 page if App is in 'development' mode and no handler for given route was added", function () {
            var displayedTemplate;

            config.env = "development";
            client.dispatchRoute("404");
            displayedTemplate = client.getMainPage().getSubPage()._root.outerHTML;

            expect(displayedTemplate).to.contain("404");
        });

        it("should be chainable", function () {
            client
                .addRoute("blog/posts/:id", "blog/posts")
                .addRoute("blog/posts/author=:authorId", "blog/posts");
        });

    });

});