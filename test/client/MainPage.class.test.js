"use strict"; // run code in ES5 strict mode

var expect = require("../testHelpers/expect.jquery.js"),
    Page = require("../../lib/client/Page.class.js"),
    MainPage = require("../../lib/client/MainPage.class.js");

describe("MainPage", function () {
    var main,
        blog,
        posts,
        about;

    beforeEach(function () {
        main = new MainPage();
        blog = new Page();
        posts = new Page();
        about = new Page();
    });

    describe(".constructor()", function () {

        it("should pass all params to the super class", function () {
            var ctx = {},
                template = "<div></div>";

            main = new MainPage(ctx, template);
            expect(main.getRoot()).to.eql(template);
            expect(main.context).to.be(ctx);
        });

        it("should use document.body as page-node when the root is the document and there is no page-node within the document", function () {
            main = new MainPage({}, document);
            expect(main.getNode("page")).to.be(document.body);
        });
    });

    describe(".isInDocument()", function () {

        it("should return false if it's not part of the document", function () {
            expect(main.isInDocument()).to.be(false);
        });

        it("should return true if it is part of the document", function () {
            main = new MainPage({}, document);
            expect(main.isInDocument()).to.be(true);
            main = new MainPage({}, document.body);
            expect(main.isInDocument()).to.be(true);
        });

    });

    describe(".getSubPages()", function () {
        var subPages;

        it("should return an empty array if there are no sub-pages", function () {
            subPages = main.getSubPages();
            expect(subPages).to.be.an(Array);
            expect(subPages).to.have.length(0);
        });
        it("should return an array with the current page hierarchy", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            expect(main.getSubPages()).to.eql([blog, posts]);
            blog.setSubPage(about);
            expect(main.getSubPages()).to.eql([blog, about]);
        });

    });

    /*
    describe(".setSubPages()", function () {

        it("should set all pages according to the given array", function () {
            main.setSubPages([blog, posts]);
            expect(main.getSubPage()).to.be(blog);
            expect(blog.getSubPage()).to.be(posts);
        });

        it("should remove pages that are not in the given array", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages([]);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should be possible to remove all sub-pages by passing null", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages(null);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should not re-set pages that are in both arrays", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            blog.setSubPage = function () {
                throw new Error("This function should not be called");
            };
            main.setSubPages([blog, posts, about]);
            expect(posts.getSubPage()).to.be(about);
        });

        it("should be chainable", function () {
            expect(main.setSubPages([])).to.be(main);
        });

    });*/

    return;

    describe(".changePage()", function () {

        it("should emit 'beforePageChange' first and than 'beforeLeave' on every Sub-Page that will be changed from bottom to top", function () {
            var emitted = [];

            blog.on("beforeLeave", function beforeLeaveAbout() {
                emitted.push("blog");
            });
            posts.on("beforeLeave", function beforeLeaveHome() {
                emitted.push("posts");
            });
            main.on("beforeLeave", function beforeLeaveMain() {
                throw new Error("This event should never be emitted because the main page can't be left");
            });
            main.on("beforePageChange", function beforeChangePage() {
                emitted.push("main");
            });

            main.changePage("about", {});
            expect(emitted).to.eql(["client", "posts", "blog"]);
        });

        return;

        it("should pass an Object on 'beforePageChange' including .preventDefault(), .toPageURL and .pageParams", function (done) {
            var toPageURL = "/blog/posts",
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

        it("should emit 'pageChange' if it has finished and pass an Object including .toPageURL and .pageParams", function (done) {

            var toPageUrl = "/blog",
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

        it("should accept all combinations of trailing or leading slashes but return a standardized version with a leading slash", function (done) {
            var called = 0;

            client.on("pageChange", function onPageChange(event) {
                expect(event.toPageURL).to.equal("/blog");
                if (++called === 3) {
                    done();
                }
            });

            client.changePage("blog");
            PageLoaderMock.instance.callback(null, [new PageMock()]);

            client.changePage("blog/");
            PageLoaderMock.instance.callback(null, [new PageMock()]);

            client.changePage("/blog/");
            PageLoaderMock.instance.callback(null, [new PageMock()]);
        });

        it("should be possible to change current page to MainPage with '/' as route", function (done) {
            var currentPages;

            client.on("pageChange", function onPageChange() {
                currentPages = client.getCurrentPages();
                //MainPage is always on index 0.
                expect(currentPages[0]).to.be(client.getMainPage());
                done();
            });

            client.changePage("/", {});
        });

        it("should be possible to change current page to MainPage with '' as route", function (done) {
            var currentPages;

            client.on("pageChange", function onPageChange() {
                currentPages = client.getCurrentPages();
                //MainPage is always on index 0.
                expect(currentPages[0]).to.be(client.getMainPage());
                done();
            });

            client.changePage("", {});
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

    return;

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
