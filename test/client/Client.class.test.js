"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    _ = require("underscore"),
    value = require("value"),
    checkError = require("../testHelpers/checkError.js"),
    pageJS = require("page"),
    config = require("../../lib/client/config.client.js"),
    Client = require("../../lib/client/Client.class.js"),
    MainPage = require("../../lib/client/MainPage.class.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js");

describe("Client", function () {

    var client,
        checkForTypeError = checkError(TypeError),
        path;

    beforeEach(function () {
        client = new Client();

        pageJS.callbacks = [];  // removes previous routes
        path = window.location.pathname + window.location.search;
    });

    afterEach(function () {
        history.replaceState(null, null, path);
        if (client.mainPage) {
            client.mainPage.dispose();
        }
    });

    describe(".constructor() / .instance", function () {

        it("should return an instance of Client", function () {
            client = new Client();
            expect(client).to.be.an(Client);
        });

        it("should add the instance to the Client-function", function () {
            expect(Client.instance).to.be(client);
        });

    });

    describe(".start() / .mainPage / .MainPage", function () {
        var MyMainPage;

        it("should create an instance of Client.MainPage", function () {
            client.start();
            expect(client.mainPage).to.be.a(client.MainPage);
        });

        it("should also be possible to provide an own MainPage", function () {
            MyMainPage = MainPage.extend("MyMainPage");

            client.MainPage = MyMainPage;
            client.start();
            expect(client.mainPage).to.be.a(MyMainPage);
        });

        it("should instantiate my MainPage with the initial content and the document as root", function (done) {
            MyMainPage = MainPage.extend("MyMainPage", {
                constructor: function (ctx, node) {
                    expect(ctx).to.be.a(pageJS.Context);
                    expect(ctx.path).to.be("/some/path");
                    expect(node).to.be(document);
                    done();
                }
            });

            client.MainPage = MyMainPage;
            history.replaceState(null, null, "/some/path");
            client.start();
        });

        it("should throw a TypeError if the MainPage-Class is not a child of MainPage", function () {
            expect(function () {
                client.MainPage = function () {};
                client.start();
            }).to.throwError(checkForTypeError);
        });

    });

    describe(".dispatchRoute()", function () {

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

        var pageUrl,
            context,
            pushState,
            replaceState,
            changePage;

        function noop() {}

        before(function () {
            pushState = history.pushState;
            replaceState = history.replaceState;
            changePage = MainPage.prototype.changePage;

            history.pushState = noop;
            history.replaceState = noop;
            MainPage.prototype.changePage = function (pageUrlToLoad, ctx) {
                pageUrl = pageUrlToLoad;
                context = ctx;
            };
        });

        after(function () {
            //undo monkey patches
            history.pushState = pushState;
            history.replaceState = replaceState;
            MainPage.prototype.changePage = changePage;
        });

        afterEach(function () {
            pageJS.stop();
        });

        it("should execute the added route handlers like pageJS", function () {
            var called = [];

            client
                .addRoute("*", function (ctx, next) {
                    expect(ctx).to.be.a(pageJS.Context);
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

            expect(pageUrl).to.be("blog/about");
        });

        it("should take the route as pageUrl when passing only on argument", function () {
            client.addRoute("blog/about");
            client.dispatchRoute("blog/about");

            expect(pageUrl).to.be("blog/about");
        });

        it("should pass the params from route", function () {
            client.addRoute("blog/:author/posts/:postId", function (ctx, next) {
                expect(ctx.params.author).to.be("spook");
                expect(ctx.params.postId).to.be("123");
                next();
            });
            client.addRoute("blog/:author/posts/:postId", "blog/posts");
            client.start();
            client.dispatchRoute("blog/spook/posts/123");

            expect(context.params.author).to.be("spook");
            expect(context.params.postId).to.be("123");
        });

        it("should be chainable", function () {
            expect(client.addRoute("/blog")).to.be(client);
        });

    });

    describe(".changePage()", function () {

        it("should just proxy to client.mainPage.changePage()", function (done) {
            client.start();
            client.mainPage.changePage = function () {
                expect(arguments).to.eql([1,2,3]);
                done();
            };
            client.changePage(1, 2, 3);
        });

    });

});